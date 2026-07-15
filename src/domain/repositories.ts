/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DebtCase, User, AuditLog, Tenant } from "../types";

/**
 * Interface Segregation Principle: Clean Repository contracts.
 * Concrete implementations (infrastructure layer) will implement these.
 */

export interface IDebtCaseRepository {
  findById(id: string, tenantId: string): Promise<DebtCase | null>;
  findByBankId(bankId: string, tenantId: string): Promise<DebtCase[]>;
  findByExecutiveId(executiveId: string, tenantId: string): Promise<DebtCase[]>;
  save(debtCase: DebtCase): Promise<DebtCase>;
  searchCases(tenantId: string, filters: { stage?: string; minDpd?: number }): Promise<DebtCase[]>;
}

export interface IUserRepository {
  findById(id: string, tenantId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findHierarchyReporting(managerId: string): Promise<User[]>;
  save(user: User): Promise<User>;
}

export interface IAuditLogRepository {
  log(auditLog: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog>;
  findByTenantId(tenantId: string, limit?: number): Promise<AuditLog[]>;
  findByCorrelationId(correlationId: string): Promise<AuditLog[]>;
}

export interface ITenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findByCode(code: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<Tenant>;
}
