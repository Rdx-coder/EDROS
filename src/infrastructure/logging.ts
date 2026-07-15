/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IDebtCaseRepository, IUserRepository, IAuditLogRepository } from "../domain/repositories";
import { DebtCase, User, AuditLog, UserRole } from "../types";

import { PinoLogger } from "./pinoLogger";

/**
 * Enterprise Structured Logger
 */
export class StructuredLogger {
  private static logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR" = "INFO";

  public static setLevel(level: "DEBUG" | "INFO" | "WARN" | "ERROR") {
    this.logLevel = level;
  }

  public static info(message: string, correlationId?: string, meta?: any) {
    PinoLogger.info(message, { correlationId, ...meta });
  }

  public static warn(message: string, correlationId?: string, meta?: any) {
    PinoLogger.warn(message, { correlationId, ...meta });
  }

  public static error(message: string, correlationId?: string, meta?: any) {
    PinoLogger.error(message, { correlationId, ...meta });
  }

  public static debug(message: string, correlationId?: string, meta?: any) {
    PinoLogger.debug(message, { correlationId, ...meta });
  }
}

/**
 * Clean Architecture Exceptions
 */
export class EDROSError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: any
  ) {
    super(message);
    this.name = "EDROSError";
  }
}

export class UnauthorizedError extends EDROSError {
  constructor(message = "Unauthorized access token.") {
    super("UNAUTHORIZED_ACCESS", message, 401);
  }
}

export class ForbiddenError extends EDROSError {
  constructor(message = "Access forbidden under Role-Based security parameters.") {
    super("RBAC_FORBIDDEN", message, 403);
  }
}

/**
 * Concrete In-Memory Infrastructure Repositories
 * Facilitates quick execution while mirroring database architectures
 */
export class InMemoryDebtCaseRepository implements IDebtCaseRepository {
  private cases = new Map<string, DebtCase>();

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed standard test cases
    const initialCases: DebtCase[] = [
      {
        id: "case-01",
        tenantId: "tenant-delta",
        bankId: "bank-sbi",
        accountNumber: "XXXXXXXX4455",
        debtorName: "Vikram Malhotra",
        principalAmount: 500000,
        outstandingAmount: 420000,
        delinquencyDays: 120, // STAGE 3
        stage: "STAGE_3_FIELD_VISIT",
        allocatedExecutiveId: "exec-01",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "case-02",
        tenantId: "tenant-delta",
        bankId: "bank-hdfc",
        accountNumber: "XXXXXXXX9988",
        debtorName: "Sarah Jenkins",
        principalAmount: 1200000,
        outstandingAmount: 1100000,
        delinquencyDays: 185, // STAGE 4
        stage: "STAGE_4_LEGAL_NOTICE",
        allocatedExecutiveId: "exec-02",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "case-03",
        tenantId: "tenant-delta",
        bankId: "bank-sbi",
        accountNumber: "XXXXXXXX3322",
        debtorName: "Rajesh Kumar",
        principalAmount: 250000,
        outstandingAmount: 220000,
        delinquencyDays: 45, // STAGE 2
        stage: "STAGE_2_TELE_CALLING",
        allocatedExecutiveId: "exec-01",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const c of initialCases) {
      this.cases.set(c.id, c);
    }
  }

  async findById(id: string, tenantId: string): Promise<DebtCase | null> {
    const debtCase = this.cases.get(id);
    if (debtCase && debtCase.tenantId === tenantId) {
      return { ...debtCase };
    }
    return null;
  }

  async findByBankId(bankId: string, tenantId: string): Promise<DebtCase[]> {
    return Array.from(this.cases.values()).filter(
      (c) => c.bankId === bankId && c.tenantId === tenantId
    );
  }

  async findByExecutiveId(executiveId: string, tenantId: string): Promise<DebtCase[]> {
    return Array.from(this.cases.values()).filter(
      (c) => c.allocatedExecutiveId === executiveId && c.tenantId === tenantId
    );
  }

  async save(debtCase: DebtCase): Promise<DebtCase> {
    this.cases.set(debtCase.id, { ...debtCase });
    return { ...debtCase };
  }

  async searchCases(tenantId: string, filters: { stage?: string; minDpd?: number }): Promise<DebtCase[]> {
    let result = Array.from(this.cases.values()).filter((c) => c.tenantId === tenantId);
    if (filters.stage) {
      result = result.filter((c) => c.stage === filters.stage);
    }
    if (filters.minDpd) {
      result = result.filter((c) => c.delinquencyDays >= filters.minDpd!);
    }
    return result;
  }
}

export class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, User>();

  constructor() {
    this.seed();
  }

  private seed() {
    const mockUsers: User[] = [
      {
        id: "exec-01",
        tenantId: "tenant-delta",
        username: "exec_rohan",
        email: "rohan.executive@edros.net",
        role: UserRole.RECOVERY_EXECUTIVE,
        isActive: true,
        stateId: "state-mh",
        regionId: "region-west",
        branchId: "branch-mumbai",
        teamId: "team-squad-alpha",
        reportingToId: "lead-01"
      },
      {
        id: "exec-02",
        tenantId: "tenant-delta",
        username: "exec_david",
        email: "david.exec@edros.net",
        role: UserRole.RECOVERY_EXECUTIVE,
        isActive: true,
        stateId: "state-mh",
        regionId: "region-west",
        branchId: "branch-mumbai",
        teamId: "team-squad-beta",
        reportingToId: "lead-01"
      },
      {
        id: "lead-01",
        tenantId: "tenant-delta",
        username: "lead_priya",
        email: "priya.leader@edros.net",
        role: UserRole.TEAM_LEADER,
        isActive: true,
        stateId: "state-mh",
        regionId: "region-west",
        branchId: "branch-mumbai",
        teamId: "team-squad-alpha",
        reportingToId: "branch-mgr-01"
      },
      {
        id: "branch-mgr-01",
        tenantId: "tenant-delta",
        username: "mgr_sharma",
        email: "sharma.branch@edros.net",
        role: UserRole.BRANCH_MANAGER,
        isActive: true,
        stateId: "state-mh",
        regionId: "region-west",
        branchId: "branch-mumbai",
        reportingToId: "reg-mgr-01"
      },
      {
        id: "reg-mgr-01",
        tenantId: "tenant-delta",
        username: "reg_verma",
        email: "verma.regional@edros.net",
        role: UserRole.REGIONAL_MANAGER,
        isActive: true,
        stateId: "state-mh",
        regionId: "region-west"
      }
    ];

    for (const u of mockUsers) {
      this.users.set(u.id, u);
    }
  }

  async findById(id: string, tenantId: string): Promise<User | null> {
    const user = this.users.get(id);
    if (user && user.tenantId === tenantId) {
      return { ...user };
    }
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const u = Array.from(this.users.values()).find((u) => u.email === email);
    return u ? { ...u } : null;
  }

  async findHierarchyReporting(managerId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter((u) => u.reportingToId === managerId);
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, { ...user });
    return { ...user };
  }
}

export class InMemoryAuditLogRepository implements IAuditLogRepository {
  private logs: AuditLog[] = [];

  async log(auditLog: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog> {
    const completeLog: AuditLog = {
      ...auditLog,
      id: `audit-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    this.logs.push(completeLog);
    StructuredLogger.info(
      `[AUDIT] Action: ${auditLog.action} | User: ${auditLog.userEmail} | Status: ${auditLog.status}`,
      auditLog.correlationId,
      auditLog.payload
    );
    return completeLog;
  }

  async findByTenantId(tenantId: string, limit = 50): Promise<AuditLog[]> {
    return this.logs
      .filter((l) => l.tenantId === tenantId)
      .slice(-limit)
      .reverse();
  }

  async findByCorrelationId(correlationId: string): Promise<AuditLog[]> {
    return this.logs.filter((l) => l.correlationId === correlationId);
  }
}
