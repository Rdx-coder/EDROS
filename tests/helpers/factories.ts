/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, DebtCase, AuditLog, Tenant, UserRole } from "../../src/types";
import { IDebtCaseRepository, IUserRepository, IAuditLogRepository, ITenantRepository } from "../../src/domain/repositories";

// ==============================================================================
// 1. DATA BUILDERS / FACTORIES
// ==============================================================================

export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: `user-${Math.random().toString(36).substring(2, 9)}`,
    tenantId: "tenant-delta",
    username: "test_executive",
    email: "executive@edros.net",
    role: UserRole.RECOVERY_EXECUTIVE,
    isActive: true,
    stateId: "state-west",
    regionId: "region-west",
    branchId: "branch-mumbai",
    teamId: "team-alpha",
    ...overrides,
  };
}

export function createTestDebtCase(overrides: Partial<DebtCase> = {}): DebtCase {
  return {
    id: `case-${Math.random().toString(36).substring(2, 9)}`,
    tenantId: "tenant-delta",
    bankId: "bank-alpha",
    accountNumber: "XXXX-XXXX-1234",
    debtorName: "John Doe",
    principalAmount: 100000,
    outstandingAmount: 85000,
    delinquencyDays: 95,
    stage: "STAGE_2_TELE_CALLING",
    allocatedExecutiveId: "user-exec-123",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestTenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: `tenant-${Math.random().toString(36).substring(2, 9)}`,
    name: "Delta Recovery Agencies",
    code: "ARC-DELTA",
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  };
}

// ==============================================================================
// 2. HIGH-FIDELITY IN-MEMORY MOCK REPOSITORIES
// ==============================================================================

export class MockDebtCaseRepository implements IDebtCaseRepository {
  public db = new Map<string, DebtCase>();

  async findById(id: string, tenantId: string): Promise<DebtCase | null> {
    const item = this.db.get(id);
    if (item && item.tenantId === tenantId) {
      return { ...item };
    }
    return null;
  }

  async findByBankId(bankId: string, tenantId: string): Promise<DebtCase[]> {
    return Array.from(this.db.values())
      .filter((item) => item.bankId === bankId && item.tenantId === tenantId)
      .map((item) => ({ ...item }));
  }

  async findByExecutiveId(executiveId: string, tenantId: string): Promise<DebtCase[]> {
    return Array.from(this.db.values())
      .filter((item) => item.allocatedExecutiveId === executiveId && item.tenantId === tenantId)
      .map((item) => ({ ...item }));
  }

  async save(debtCase: DebtCase): Promise<DebtCase> {
    const saved = { ...debtCase, updatedAt: new Date() };
    this.db.set(saved.id, saved);
    return saved;
  }

  async searchCases(tenantId: string, filters: { stage?: string; minDpd?: number }): Promise<DebtCase[]> {
    return Array.from(this.db.values())
      .filter((item) => {
        if (item.tenantId !== tenantId) return false;
        if (filters.stage && item.stage !== filters.stage) return false;
        if (filters.minDpd && item.delinquencyDays < filters.minDpd) return false;
        return true;
      })
      .map((item) => ({ ...item }));
  }

  // Helper for test setup
  public seed(cases: DebtCase[]) {
    for (const c of cases) {
      this.db.set(c.id, c);
    }
  }
}

export class MockUserRepository implements IUserRepository {
  public db = new Map<string, User>();

  async findById(id: string, tenantId: string): Promise<User | null> {
    const item = this.db.get(id);
    if (item && item.tenantId === tenantId) {
      return { ...item };
    }
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const item = Array.from(this.db.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
    return item ? { ...item } : null;
  }

  async findHierarchyReporting(managerId: string): Promise<User[]> {
    return Array.from(this.db.values())
      .filter((u) => u.reportingToId === managerId)
      .map((u) => ({ ...u }));
  }

  async save(user: User): Promise<User> {
    const saved = { ...user };
    this.db.set(saved.id, saved);
    return saved;
  }

  // Helper for test setup
  public seed(users: User[]) {
    for (const u of users) {
      this.db.set(u.id, u);
    }
  }
}

export class MockAuditLogRepository implements IAuditLogRepository {
  public logs: AuditLog[] = [];

  async log(auditLog: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog> {
    const logged: AuditLog = {
      id: `audit-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      ...auditLog,
    };
    this.logs.push(logged);
    return logged;
  }

  async findByTenantId(tenantId: string, limit?: number): Promise<AuditLog[]> {
    const filtered = this.logs.filter((l) => l.tenantId === tenantId);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async findByCorrelationId(correlationId: string): Promise<AuditLog[]> {
    return this.logs.filter((l) => l.correlationId === correlationId);
  }
}

export class MockTenantRepository implements ITenantRepository {
  public db = new Map<string, Tenant>();

  async findById(id: string): Promise<Tenant | null> {
    const item = this.db.get(id);
    return item ? { ...item } : null;
  }

  async findByCode(code: string): Promise<Tenant | null> {
    const item = Array.from(this.db.values()).find((t) => t.code === code);
    return item ? { ...item } : null;
  }

  async save(tenant: Tenant): Promise<Tenant> {
    const saved = { ...tenant };
    this.db.set(saved.id, saved);
    return saved;
  }

  // Helper for test setup
  public seed(tenants: Tenant[]) {
    for (const t of tenants) {
      this.db.set(t.id, t);
    }
  }
}
