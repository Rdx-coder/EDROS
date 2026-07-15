/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { DebtRecoveryUseCase } from "../../src/application/services";
import { UserRole } from "../../src/types";
import { ValidationError, ForbiddenError, NotFoundError } from "../../src/infrastructure/exceptions";
import {
  createTestUser,
  createTestDebtCase,
  MockDebtCaseRepository,
  MockUserRepository,
  MockAuditLogRepository
} from "../helpers/factories";
import { redisCache } from "../../src/infrastructure/redisClient";

// Mock the Redis Cache
vi.mock("../../src/infrastructure/redisClient", () => ({
  redisCache: {
    del: vi.fn().mockResolvedValue(true),
    invalidatePattern: vi.fn().mockResolvedValue(true),
  }
}));

describe("DebtRecoveryUseCase Unit Tests", () => {
  let debtRepo: MockDebtCaseRepository;
  let userRepo: MockUserRepository;
  let auditRepo: MockAuditLogRepository;
  let useCase: DebtRecoveryUseCase;

  const correlationId = "tx-unit-test-123";

  beforeEach(() => {
    debtRepo = new MockDebtCaseRepository();
    userRepo = new MockUserRepository();
    auditRepo = new MockAuditLogRepository();
    useCase = new DebtRecoveryUseCase(debtRepo, userRepo, auditRepo);
    vi.clearAllMocks();
  });

  describe("allocateCase", () => {
    it("should throw a ValidationError if Case ID or Executive ID is missing", async () => {
      const operator = createTestUser({ role: UserRole.BRANCH_MANAGER });
      await expect(useCase.allocateCase("", "exec-1", operator, correlationId)).rejects.toThrow(ValidationError);
      await expect(useCase.allocateCase("case-1", "", operator, correlationId)).rejects.toThrow(ValidationError);
    });

    it("should throw ForbiddenError if operator has an insufficient role", async () => {
      const operator = createTestUser({ role: UserRole.RECOVERY_EXECUTIVE });
      await expect(useCase.allocateCase("case-123", "exec-1", operator, correlationId)).rejects.toThrow(ForbiddenError);

      // Verify that audit log records the access denial
      expect(auditRepo.logs.length).toBe(1);
      expect(auditRepo.logs[0].action).toBe("ALLOCATE_CASE_DENIED");
      expect(auditRepo.logs[0].status).toBe("DENIED");
    });

    it("should throw NotFoundError if the debt case does not exist", async () => {
      const operator = createTestUser({ role: UserRole.BRANCH_MANAGER });
      const targetExec = createTestUser({ id: "exec-1", role: UserRole.RECOVERY_EXECUTIVE });
      userRepo.seed([targetExec]);

      await expect(useCase.allocateCase("nonexistent-case", "exec-1", operator, correlationId)).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if the target executive is not registered as a RECOVERY_EXECUTIVE", async () => {
      const operator = createTestUser({ role: UserRole.BRANCH_MANAGER });
      const nonExecUser = createTestUser({ id: "user-2", role: UserRole.TEAM_LEADER });
      const debtCase = createTestDebtCase({ id: "case-1" });
      
      userRepo.seed([nonExecUser]);
      debtRepo.seed([debtCase]);

      await expect(useCase.allocateCase("case-1", "user-2", operator, correlationId)).rejects.toThrow(ValidationError);
    });

    it("should successfully reallocate a case, clear caches, and write an audit event when authorized", async () => {
      const operator = createTestUser({ role: UserRole.BRANCH_MANAGER });
      const targetExec = createTestUser({ id: "exec-1", role: UserRole.RECOVERY_EXECUTIVE });
      const debtCase = createTestDebtCase({ id: "case-1", allocatedExecutiveId: "exec-old" });

      userRepo.seed([targetExec]);
      debtRepo.seed([debtCase]);

      const result = await useCase.allocateCase("case-1", "exec-1", operator, correlationId);

      // Verify allocations
      expect(result.allocatedExecutiveId).toBe("exec-1");
      const fetched = await debtRepo.findById("case-1", "tenant-delta");
      expect(fetched?.allocatedExecutiveId).toBe("exec-1");

      // Verify Cache Invalidation
      expect(redisCache.del).toHaveBeenCalledWith("cache:debt_case:case-1:tenant-delta");
      expect(redisCache.invalidatePattern).toHaveBeenCalledWith("cache:dashboard_metrics:*");

      // Verify Audit Logging
      expect(auditRepo.logs.length).toBe(1);
      const log = auditRepo.logs[0];
      expect(log.action).toBe("ALLOCATE_CASE");
      expect(log.status).toBe("SUCCESS");
      expect(log.payload).toEqual({ previousExecutive: "exec-old", newExecutive: "exec-1" });
    });
  });

  describe("approveSettlement", () => {
    it("should reject negative settlement amounts", async () => {
      const operator = createTestUser({ role: UserRole.BRANCH_MANAGER });
      await expect(useCase.approveSettlement("case-1", -500, operator, correlationId)).rejects.toThrow(ValidationError);
    });

    it("should reject when case outstanding amount is zero", async () => {
      const operator = createTestUser({ role: UserRole.BRANCH_MANAGER });
      const settledCase = createTestDebtCase({ id: "case-1", outstandingAmount: 0 });
      debtRepo.seed([settledCase]);

      await expect(useCase.approveSettlement("case-1", 100, operator, correlationId)).rejects.toThrow(ValidationError);
    });

    it("should approve L1 haircut (<= 15%) when evaluated by a Team Leader", async () => {
      const approver = createTestUser({ role: UserRole.TEAM_LEADER });
      // Haircut ratio: (100k - 90k) / 100k = 10% (<= 15%, so L1)
      const debtCase = createTestDebtCase({ id: "case-1", principalAmount: 100000, outstandingAmount: 100000 });
      debtRepo.seed([debtCase]);

      const result = await useCase.approveSettlement("case-1", 90000, approver, correlationId);

      expect(result.stage).toBe("STAGE_6_SETTLED");
      expect(result.outstandingAmount).toBe(0);
      expect(auditRepo.logs[0].action).toBe("APPROVE_SETTLEMENT");
      expect(auditRepo.logs[0].payload?.approvalLevel).toBe("L1");
    });

    it("should reject L2 haircut (<= 30%) when evaluated by a Team Leader but approve for a Branch Manager", async () => {
      const tlApprover = createTestUser({ role: UserRole.TEAM_LEADER });
      const bmApprover = createTestUser({ role: UserRole.BRANCH_MANAGER });
      // Haircut ratio: (100k - 80k) / 100k = 20% (> 15% and <= 30%, so L2)
      const debtCase = createTestDebtCase({ id: "case-1", principalAmount: 100000, outstandingAmount: 100000 });
      debtRepo.seed([debtCase]);

      // Team leader rejects
      await expect(useCase.approveSettlement("case-1", 80000, tlApprover, correlationId)).rejects.toThrow(ForbiddenError);
      expect(auditRepo.logs[0].action).toBe("SETTLEMENT_DENIED_LIMIT");

      // Branch Manager succeeds
      const result = await useCase.approveSettlement("case-1", 80000, bmApprover, correlationId);
      expect(result.stage).toBe("STAGE_6_SETTLED");
      expect(auditRepo.logs[1].action).toBe("APPROVE_SETTLEMENT");
      expect(auditRepo.logs[1].payload?.approvalLevel).toBe("L2");
    });

    it("should reject L3 haircut (> 30%) for Branch Manager but approve for Regional Manager", async () => {
      const bmApprover = createTestUser({ role: UserRole.BRANCH_MANAGER });
      const rmApprover = createTestUser({ role: UserRole.REGIONAL_MANAGER });
      // Haircut ratio: (100k - 60k) / 100k = 40% (> 30%, so L3)
      const debtCase = createTestDebtCase({ id: "case-1", principalAmount: 100000, outstandingAmount: 100000 });
      debtRepo.seed([debtCase]);

      // Branch Manager rejects
      await expect(useCase.approveSettlement("case-1", 60000, bmApprover, correlationId)).rejects.toThrow(ForbiddenError);

      // Regional Manager succeeds
      const result = await useCase.approveSettlement("case-1", 60000, rmApprover, correlationId);
      expect(result.stage).toBe("STAGE_6_SETTLED");
      expect(auditRepo.logs[1].payload?.approvalLevel).toBe("L3");
    });
  });
});
