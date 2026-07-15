/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enterprise Debt Recovery Operating System (EDROS) Core Type Definitions
 * Designed for Multi-tenant, Multi-bank operations under strict RBAC constraints.
 */

// Role-Based Access Control (RBAC)
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",                 // Full access across all tenants (System Admin)
  TENANT_ADMIN = "TENANT_ADMIN",               // Administrator of a specific tenant (e.g. Legal Firm or Agency)
  BANK_COMPLIANCE_OFFICER = "BANK_COMPLIANCE", // Audits compliance, reviews settlements
  RECOVERY_HEAD = "RECOVERY_HEAD",             // Oversees recovery pipelines across states/regions
  REGIONAL_MANAGER = "REGIONAL_MANAGER",       // Manages a specific geographical region
  BRANCH_MANAGER = "BRANCH_MANAGER",           // Manages a physical recovery branch office
  TEAM_LEADER = "TEAM_LEADER",                 // Supervises a team of collection/recovery executives
  RECOVERY_EXECUTIVE = "RECOVERY_EXECUTIVE",   // Hands-on field agents or tele-callers doing recoveries
  LEGAL_COUNSEL = "LEGAL_COUNSEL",             // Handles litigation, notices, and insolvency filings
  OWNER = "OWNER",                             // Agency Owner
  NATIONAL_HEAD = "NATIONAL_HEAD",             // National Recovery Head
  STATE_MANAGER = "STATE_MANAGER",             // State Operations Manager
  LEGAL_OFFICER = "LEGAL_OFFICER",             // Legal Officer / In-house counsel
  FINANCE = "FINANCE",                         // Finance & Settlements Auditor
  HR = "HR",                                   // Human Resources Manager
  SALES = "SALES",                             // Sales & Client Acquisition
  AUDITOR = "AUDITOR",                         // Internal/External Auditor
  SYSTEM_ADMIN = "SYSTEM_ADMIN"                // System Administrator
}

export enum Permission {
  // System Management
  MANAGE_TENANTS = "MANAGE_TENANTS",
  MANAGE_BANKS = "MANAGE_BANKS",
  
  // Organization / Hierarchy Management
  MANAGE_HIERARCHY = "MANAGE_HIERARCHY",
  MANAGE_USERS = "MANAGE_USERS",
  
  // Debt Account Operations
  VIEW_DEBT_SENSITIVE = "VIEW_DEBT_SENSITIVE",
  ALLOCATE_DEBT_CASES = "ALLOCATE_DEBT_CASES",
  INITIATE_RECOVERY_ACTION = "INITIATE_RECOVERY_ACTION",
  
  // Financial Approvals
  APPROVE_SETTLEMENT_L1 = "APPROVE_SETTLEMENT_L1", // Small haircut, team-lead level
  APPROVE_SETTLEMENT_L2 = "APPROVE_SETTLEMENT_L2", // Medium haircut, branch-mgr level
  APPROVE_SETTLEMENT_L3 = "APPROVE_SETTLEMENT_L3", // High haircut, regional/head level
  
  // Audits & Legal
  GENERATE_LEGAL_NOTICE = "GENERATE_LEGAL_NOTICE",
  VIEW_AUDIT_LOGS = "VIEW_AUDIT_LOGS"
}

// Multi-Tenant and Multi-Bank Definitions
export interface Tenant {
  id: string;
  name: string;             // Legal name of Recovery Agency, Law Firm, or ARC (Asset Reconstruction Company)
  code: string;             // Unique identifier code (e.g. "ARC-ALPHA")
  isActive: boolean;
  createdAt: Date;
}

export interface Bank {
  id: string;
  name: string;             // Partnering Bank / NBFC (e.g., "State Bank of India", "HDFC Bank")
  logoUrl?: string;
  tenantId: string;         // Under which tenant this bank is configured (for multi-tenant setups)
  status: "ACTIVE" | "SUSPENDED";
}

// Geographical and Team Hierarchy: State -> Region -> Branch -> Team -> Executive
export interface StateHierarchy {
  id: string;
  name: string;             // e.g. "Maharashtra", "Texas"
  tenantId: string;
}

export interface RegionHierarchy {
  id: string;
  name: string;             // e.g. "Western Region", "Zone A"
  stateId: string;
}

export interface BranchHierarchy {
  id: string;
  name: string;             // e.g. "Mumbai Corporate Branch", "Dallas North"
  regionId: string;
  address: string;
}

export interface TeamHierarchy {
  id: string;
  name: string;             // e.g. "NPA Recovery Squad Alpha", "Tele-calling Team 2"
  branchId: string;
  teamLeaderId: string;     // User ID of the Team Leader
}

// Enterprise Identity
export interface User {
  id: string;
  tenantId: string;         // Multi-tenant isolation boundary
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  // Position in the corporate hierarchy
  stateId?: string;
  regionId?: string;
  branchId?: string;
  teamId?: string;
  reportingToId?: string;   // Manager's user ID
}

// Debt Account Domain
export interface DebtCase {
  id: string;
  tenantId: string;
  bankId: string;           // Multi-bank support
  accountNumber: string;    // Masked on read depending on permission
  debtorName: string;
  principalAmount: number;
  outstandingAmount: number;
  delinquencyDays: number;  // Days Past Due (DPD)
  stage: "STAGE_1_PRE_NOTICE" | "STAGE_2_TELE_CALLING" | "STAGE_3_FIELD_VISIT" | "STAGE_4_LEGAL_NOTICE" | "STAGE_5_LITIGATION" | "STAGE_6_SETTLED" | "STAGE_7_WRITTEN_OFF";
  allocatedExecutiveId?: string; // Assigned Recovery Executive
  createdAt: Date;
  updatedAt: Date;
}

// Security, Audit & Telemetry Logs
export interface AuditLog {
  id: string;
  timestamp: Date;
  tenantId: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: string;           // Action code (e.g. "VIEW_SENSITIVE_ACCOUNT")
  resource: string;         // Target resource type (e.g. "DebtCase")
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  correlationId: string;    // For tracing distributed requests
  status: "SUCCESS" | "DENIED" | "FAILURE";
  payload?: Record<string, any>; // Strictly sanitized parameter log (never store raw PII/secrets)
}
