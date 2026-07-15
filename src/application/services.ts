/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IDebtCaseRepository, IUserRepository, IAuditLogRepository } from "../domain/repositories";
import { DebtCase, User, UserRole } from "../types";
import { PinoLogger } from "../infrastructure/pinoLogger";
import { redisCache } from "../infrastructure/redisClient";
import { ValidationError, ForbiddenError, NotFoundError } from "../infrastructure/exceptions";

/**
 * Service Layer (Application Layer / Use Cases)
 * Fully decoupled from Express or any specific HTTP transport mechanism.
 */
export class DebtRecoveryUseCase {
  constructor(
    private debtRepo: IDebtCaseRepository,
    private userRepo: IUserRepository,
    private auditRepo: IAuditLogRepository
  ) {}

  /**
   * Action: Reallocate a debt case to a new field recovery executive
   */
  public async allocateCase(
    caseId: string,
    executiveId: string,
    operator: User,
    correlationId: string
  ): Promise<DebtCase> {
    const tenantId = operator.tenantId;

    // Validation checks
    if (!caseId || !executiveId) {
      throw new ValidationError("Case ID and Target Executive ID are required fields.");
    }

    // Check Authorization (RBAC Guard)
    const canAllocate = [
      UserRole.SUPER_ADMIN,
      UserRole.TENANT_ADMIN,
      UserRole.RECOVERY_HEAD,
      UserRole.TEAM_LEADER,
      UserRole.NATIONAL_HEAD,
      UserRole.STATE_MANAGER,
      UserRole.BRANCH_MANAGER,
      UserRole.SYSTEM_ADMIN
    ].includes(operator.role);

    if (!canAllocate) {
      await this.auditRepo.log({
        tenantId,
        userId: operator.id,
        userEmail: operator.email,
        userRole: operator.role,
        action: "ALLOCATE_CASE_DENIED",
        resource: "DebtCase",
        resourceId: caseId,
        ipAddress: "N/A",
        userAgent: "EDROS-Core",
        correlationId,
        status: "DENIED",
        payload: { executiveId, reason: "Insufficient privileges" }
      });
      throw new ForbiddenError(`Access Denied: User role '${operator.role}' does not possess permissions to allocate cases.`);
    }

    // Load case and target executive
    const debtCase = await this.debtRepo.findById(caseId, tenantId);
    if (!debtCase) {
      throw new NotFoundError(`DebtCase with ID '${caseId}' was not found.`);
    }

    const executive = await this.userRepo.findById(executiveId, tenantId);
    if (!executive || executive.role !== UserRole.RECOVERY_EXECUTIVE) {
      throw new ValidationError(`Target user '${executiveId}' is not registered as a valid Field Recovery Executive.`);
    }

    // Reallocate
    const oldExecId = debtCase.allocatedExecutiveId;
    debtCase.allocatedExecutiveId = executiveId;
    debtCase.updatedAt = new Date();
    
    // Core database write with optimized transaction properties
    const updatedCase = await this.debtRepo.save(debtCase);

    // Evict Redis cache for this case and invalidates general analytics metrics
    await redisCache.del(`cache:debt_case:${caseId}:${tenantId}`);
    await redisCache.invalidatePattern("cache:dashboard_metrics:*");

    // Audit Log Action
    await this.auditRepo.log({
      tenantId,
      userId: operator.id,
      userEmail: operator.email,
      userRole: operator.role,
      action: "ALLOCATE_CASE",
      resource: "DebtCase",
      resourceId: caseId,
      ipAddress: "N/A",
      userAgent: "EDROS-Core",
      correlationId,
      status: "SUCCESS",
      payload: { previousExecutive: oldExecId, newExecutive: executiveId }
    });

    PinoLogger.info(`Case ${caseId} reallocated to Executive ${executiveId} by User ${operator.email}`);

    return updatedCase;
  }

  /**
   * Action: Propose settlement with authorization haircut caps (L1, L2, L3 authorization caps)
   */
  public async approveSettlement(
    caseId: string,
    settlementAmount: number,
    approver: User,
    correlationId: string
  ): Promise<DebtCase> {
    const tenantId = approver.tenantId;

    if (!caseId || settlementAmount === undefined || settlementAmount < 0) {
      throw new ValidationError("Valid Case ID and positive settlement amount are required.");
    }

    const debtCase = await this.debtRepo.findById(caseId, tenantId);
    if (!debtCase) {
      throw new NotFoundError(`DebtCase with ID '${caseId}' was not found.`);
    }

    const principal = debtCase.principalAmount;
    const totalDue = debtCase.outstandingAmount;

    if (totalDue <= 0) {
      throw new ValidationError(`Case '${caseId}' cannot be settled because outstanding balance is already zero.`);
    }

    const haircutRatio = (totalDue - settlementAmount) / totalDue;

    // Check authority limit mapping:
    // L1: Haircut <= 15% -> Team Leader
    // L2: Haircut <= 30% -> Branch Manager
    // L3: Haircut > 30% -> Regional Manager or Recovery Head
    const requiredRole: UserRole[] = [
      UserRole.SUPER_ADMIN,
      UserRole.TENANT_ADMIN,
      UserRole.OWNER,
      UserRole.SYSTEM_ADMIN
    ];
    let level = "L3";

    if (haircutRatio <= 0.15) {
      requiredRole.push(
        UserRole.TEAM_LEADER,
        UserRole.BRANCH_MANAGER,
        UserRole.REGIONAL_MANAGER,
        UserRole.RECOVERY_HEAD,
        UserRole.STATE_MANAGER,
        UserRole.NATIONAL_HEAD
      );
      level = "L1";
    } else if (haircutRatio <= 0.30) {
      requiredRole.push(
        UserRole.BRANCH_MANAGER,
        UserRole.REGIONAL_MANAGER,
        UserRole.RECOVERY_HEAD,
        UserRole.STATE_MANAGER,
        UserRole.NATIONAL_HEAD
      );
      level = "L2";
    } else {
      requiredRole.push(
        UserRole.REGIONAL_MANAGER,
        UserRole.RECOVERY_HEAD,
        UserRole.STATE_MANAGER,
        UserRole.NATIONAL_HEAD
      );
      level = "L3";
    }

    const isAuthorized = requiredRole.includes(approver.role);
    if (!isAuthorized) {
      await this.auditRepo.log({
        tenantId,
        userId: approver.id,
        userEmail: approver.email,
        userRole: approver.role,
        action: `SETTLEMENT_DENIED_LIMIT`,
        resource: "DebtCase",
        resourceId: caseId,
        ipAddress: "N/A",
        userAgent: "EDROS-Core",
        correlationId,
        status: "DENIED",
        payload: { settlementAmount, haircutRatio, level }
      });
      throw new ForbiddenError(`Settlement Authorization Level '${level}' required. Role '${approver.role}' is insufficient.`);
    }

    // Execute Settlement Stage
    debtCase.stage = "STAGE_6_SETTLED";
    debtCase.outstandingAmount = 0; // Settled to zero balance
    debtCase.updatedAt = new Date();
    
    const updatedCase = await this.debtRepo.save(debtCase);

    // Evict Redis caches
    await redisCache.del(`cache:debt_case:${caseId}:${tenantId}`);
    await redisCache.invalidatePattern("cache:dashboard_metrics:*");

    await this.auditRepo.log({
      tenantId,
      userId: approver.id,
      userEmail: approver.email,
      userRole: approver.role,
      action: "APPROVE_SETTLEMENT",
      resource: "DebtCase",
      resourceId: caseId,
      ipAddress: "N/A",
      userAgent: "EDROS-Core",
      correlationId,
      status: "SUCCESS",
      payload: { settlementAmount, haircutRatio, approvalLevel: level }
    });

    PinoLogger.info(`Case ${caseId} settled successfully at level ${level} by Approver ${approver.email}`);

    return updatedCase;
  }
}

/**
 * Dependency Injection (DI) Container
 * Implements simple, type-safe Service Locator pattern
 */
export class DIContainer {
  private static services = new Map<string, any>();

  public static register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  public static resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`DI Service Container: Service not found for key: ${key}`);
    }
    return service as T;
  }

  public static clear(): void {
    this.services.clear();
  }
}
export { Permission } from "../types";
export type { IUserRepository, IDebtCaseRepository, IAuditLogRepository } from "../domain/repositories";
