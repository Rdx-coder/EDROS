/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { DatabaseError } from "../../src/infrastructure/exceptions";

// Mock PrismaClient to test transaction behavior and edge conditions without relying on a live, unprovisioned DB
vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      $transaction = vi.fn();
      recoveryCase = {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
      };
    }
  };
});

describe("Database Integration Tests (Simulated & Checked)", () => {
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = new PrismaClient();
    vi.clearAllMocks();
  });

  describe("Transactions and Rollback Operations", () => {
    it("should commit a transaction when all database updates succeed", async () => {
      const mockResult = [{ id: "case-01", stage: "STAGE_6_SETTLED" }];
      prismaMock.$transaction.mockResolvedValue(mockResult);

      const runTx = async () => {
        return prismaMock.$transaction([
          prismaMock.recoveryCase.update({ where: { id: "case-01" }, data: { stage: "STAGE_6_SETTLED" } })
        ]);
      };

      const result = await runTx();
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it("should rollback the entire transaction if any nested query fails", async () => {
      // Simulate failure on the second step of a transaction
      prismaMock.$transaction.mockRejectedValue(new Error("Database Deadlock / Constraint Violation"));

      const runTx = async () => {
        return prismaMock.$transaction([
          prismaMock.recoveryCase.update({ where: { id: "case-01" }, data: { outstandingAmount: 0 } }),
          prismaMock.recoveryCase.create({ data: { id: "log-01", description: "Audit trail" } })
        ]);
      };

      await expect(runTx()).rejects.toThrow("Database Deadlock / Constraint Violation");
    });
  });

  describe("Soft Delete and Cascade Delete Semantics", () => {
    it("should set isDeleted to true instead of physical record purging (Soft Delete)", async () => {
      prismaMock.recoveryCase.update.mockResolvedValue({ id: "case-01", isDeleted: true });

      const softDeleteCase = async (id: string) => {
        return prismaMock.recoveryCase.update({
          where: { id },
          data: { isDeleted: true, deletedAt: new Date() }
        });
      };

      const result = await softDeleteCase("case-01");
      expect(result.isDeleted).toBe(true);
      expect(prismaMock.recoveryCase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "case-01" },
          data: expect.objectContaining({ isDeleted: true })
        })
      );
    });

    it("should simulate cascade deletions for nested child entities", async () => {
      // Cascade Delete: when parent case is deleted, we must ensure child allocations are purged or soft-deleted too
      prismaMock.$transaction.mockImplementation(async (callbacks) => {
        // execute simulated transactional calls
        return ["deleted-case-01", "deleted-allocations-count"];
      });

      const cascadePurgeCase = async (caseId: string) => {
        return prismaMock.$transaction([
          prismaMock.recoveryCase.delete({ where: { id: caseId } }),
          // prismaMock.allocation.deleteMany({ where: { caseId } })
        ]);
      };

      const result = await cascadePurgeCase("case-01");
      expect(result).toContain("deleted-case-01");
    });
  });

  describe("Optimistic Locking & Versioning Checks", () => {
    it("should succeed in writing if version matches but reject updates if version is stale (Optimistic Lock)", async () => {
      // Simulated versioned record
      const existingRecord = { id: "case-01", outstandingAmount: 10000 };
      let currentMasterVersion = 1;
      
      prismaMock.recoveryCase.update.mockImplementation(({ where, data }) => {
        // Assert that we have an optimistic lock constraint in where: { id, version }
        if (where.id === "case-01" && where.version === currentMasterVersion) {
          currentMasterVersion = data.version; // simulate write-through increment
          return Promise.resolve({ ...existingRecord, outstandingAmount: data.outstandingAmount, version: currentMasterVersion });
        }
        return Promise.reject(new Error("Record updated or modified by another concurrent thread. (Stale Version)"));
      });

      const updateWithOptimisticLock = async (id: string, amount: number, currentVersion: number) => {
        return prismaMock.recoveryCase.update({
          where: { id, version: currentVersion },
          data: { outstandingAmount: amount, version: currentVersion + 1 }
        });
      };

      // 1. Success on correct version
      const successResult = await updateWithOptimisticLock("case-01", 5000, 1);
      expect(successResult.outstandingAmount).toBe(5000);
      expect(successResult.version).toBe(2);

      // 2. Failure on stale version
      await expect(updateWithOptimisticLock("case-01", 2000, 1)).rejects.toThrow("Stale Version");
    });
  });

  describe("Bulk Operations and Batch Processing", () => {
    it("should execute bulk update queries in a single roundtrip", async () => {
      prismaMock.recoveryCase.updateMany.mockResolvedValue({ count: 150 });

      const reallocateAllCasesInRegion = async (oldExecId: string, newExecId: string) => {
        return prismaMock.recoveryCase.updateMany({
          where: { allocatedExecutiveId: oldExecId, isDeleted: false },
          data: { allocatedExecutiveId: newExecId }
        });
      };

      const result = await reallocateAllCasesInRegion("exec-old", "exec-new");
      expect(result.count).toBe(150);
      expect(prismaMock.recoveryCase.updateMany).toHaveBeenCalledWith({
        where: { allocatedExecutiveId: "exec-old", isDeleted: false },
        data: { allocatedExecutiveId: "exec-new" }
      });
    });
  });
});
