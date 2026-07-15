-- ==============================================================================
-- EDROS - Enterprise Debt Recovery Operating System (Baseline Schema)
-- Migration ID: 0001_create_edros_schema
-- Target: PostgreSQL 14+ / CockroachDB Relational Engines
-- ==============================================================================

-- 1. Tenants Isolation Table
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Partner Banks & NBFCs Configuration
CREATE TABLE IF NOT EXISTS partner_banks (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Geographical Hierarchy Level 1: States
CREATE TABLE IF NOT EXISTS state_hierarchies (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL
);

-- 4. Geographical Hierarchy Level 2: Regions (nested under State)
CREATE TABLE IF NOT EXISTS region_hierarchies (
    id VARCHAR(64) PRIMARY KEY,
    state_id VARCHAR(64) NOT NULL REFERENCES state_hierarchies(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL
);

-- 5. Geographical Hierarchy Level 3: Branches (nested under Region)
CREATE TABLE IF NOT EXISTS branch_hierarchies (
    id VARCHAR(64) PRIMARY KEY,
    region_id VARCHAR(64) NOT NULL REFERENCES region_hierarchies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL
);

-- 6. Team Hierarchy Level 4: Teams (nested under Branch)
CREATE TABLE IF NOT EXISTS team_hierarchies (
    id VARCHAR(64) PRIMARY KEY,
    branch_id VARCHAR(64) NOT NULL REFERENCES branch_hierarchies(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    team_leader_id VARCHAR(64) -- Associated supervisor
);

-- 7. Identity & RBAC Matrix: Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(64) NOT NULL CHECK (role IN (
        'SUPER_ADMIN', 'TENANT_ADMIN', 'BANK_COMPLIANCE', 
        'RECOVERY_HEAD', 'REGIONAL_MANAGER', 'BRANCH_MANAGER', 
        'TEAM_LEADER', 'RECOVERY_EXECUTIVE', 'LEGAL_COUNSEL'
    )),
    is_active BOOLEAN DEFAULT TRUE,
    state_id VARCHAR(64) REFERENCES state_hierarchies(id) ON DELETE SET NULL,
    region_id VARCHAR(64) REFERENCES region_hierarchies(id) ON DELETE SET NULL,
    branch_id VARCHAR(64) REFERENCES branch_hierarchies(id) ON DELETE SET NULL,
    team_id VARCHAR(64) REFERENCES team_hierarchies(id) ON DELETE SET NULL,
    reporting_to_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Complete circular dependency for team leader reference safely
ALTER TABLE team_hierarchies ADD CONSTRAINT fk_team_leader FOREIGN KEY (team_leader_id) REFERENCES users(id) ON DELETE SET NULL;

-- 8. Core Domain Table: Debt Cases
CREATE TABLE IF NOT EXISTS debt_cases (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    bank_id VARCHAR(64) NOT NULL REFERENCES partner_banks(id) ON DELETE CASCADE,
    account_number VARCHAR(128) NOT NULL, -- Encrypted or Masked at Rest depending on compliance
    debtor_name VARCHAR(255) NOT NULL,
    principal_amount NUMERIC(15, 2) NOT NULL,
    outstanding_amount NUMERIC(15, 2) NOT NULL,
    delinquency_days INTEGER NOT NULL DEFAULT 0,
    stage VARCHAR(64) NOT NULL CHECK (stage IN (
        'STAGE_1_PRE_NOTICE', 'STAGE_2_TELE_CALLING', 'STAGE_3_FIELD_VISIT',
        'STAGE_4_LEGAL_NOTICE', 'STAGE_5_LITIGATION', 'STAGE_6_SETTLED', 'STAGE_7_WRITTEN_OFF'
    )),
    allocated_executive_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Comprehensive System Auditing Logs (Secured and WORM-style compliant)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_role VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    resource VARCHAR(128) NOT NULL,
    resource_id VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(512) NOT NULL,
    correlation_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('SUCCESS', 'DENIED', 'FAILURE')),
    payload JSONB -- Structured meta params
);

-- 10. Performance Optimization Indices (Optimized for Multi-tenant Lookups)
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX idx_debt_cases_tenant_stage ON debt_cases(tenant_id, stage);
CREATE INDEX idx_debt_cases_exec_tenant ON debt_cases(allocated_executive_id, tenant_id);
CREATE INDEX idx_audit_logs_correlation ON audit_logs(correlation_id);
CREATE INDEX idx_audit_logs_tenant_ts ON audit_logs(tenant_id, timestamp DESC);
