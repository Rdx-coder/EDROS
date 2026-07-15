# EDROS Production Migration & Schema Rollout Plan

This document outlines the zero-downtime database migration schema rollout, index structure plan, constraints integrity, and rollback strategies for applying the 100+ normalized tables of the EDROS platform to a production PostgreSQL database.

---

## 1. Schema Lifecycle & Phase Rollouts

To ensure 24/7/365 availability of debt collection operations across multiple banking nodes, schema changes follow the **Expand and Contract (Blue-Green) pattern**.

```
[Phase 1: DB Provision] ──> [Phase 2: Table Expansion] ──> [Phase 3: Backfills] ──> [Phase 4: Contract Old Fields]
```

### Phase 1: Database Provisioning & Extension Setup
1. Enable cryptographic utilities and identity generators required by UUID constraints:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```
2. Verify connection pooling (PgBouncer) configurations. Set statement timeouts:
   ```sql
   ALTER ROLE edros_app SET statement_timeout = '15s';
   ```

### Phase 2: Relational Tables Creation (Non-blocking)
- Deploy DDL migrations in a single transactional lock session.
- Keep foreign keys `ON DELETE NO ACTION` on critical master ledger entries (`double_entry_journals`, `ledger_accounts`) to prevent accidental wipeouts of structural logs.
- Add soft-delete flag indexes (`is_deleted = false`) to exclude deleted rows from primary queries automatically.

---

## 2. Structural Index Optimization Map

Our highly normalized database (101 tables) features high-density index strategies to optimize heavy transaction query operations.

| Target Table | Target Columns | Index Type | Business Justification |
| :--- | :--- | :--- | :--- |
| `audit_logs` | `(tenant_id, timestamp DESC)` | B-Tree (Composite) | Powers real-time compliance portal searches. |
| `audit_logs` | `correlation_id` | B-Tree | Allows trace-tracing of individual API requests. |
| `recovery_cases` | `(tenant_id, stage, is_deleted)` | B-Tree (Partial) | Powers executive allocation boards where `is_deleted = false`. |
| `gps_locations` | `(employee_id, recorded_at DESC)` | B-Tree (Composite) | Powers active agent live route tracking maps in real-time. |
| `users` | `(tenant_id, email)` | Unique Hash | Multi-tenant isolation boundary login checks. |
| `tele_calls` | `case_id` | B-Tree | Speeds up the rendering of individual case timelines. |
| `payslips` | `(employee_id, month_year)` | Unique B-Tree | Prevents duplicate payroll disbursements for the same calendar month. |

---

## 3. Strict Relational Constraints

To safeguard sovereign ledger balances and operational audits:

1. **Transactional Integrity**: Ledgers (`ledger_accounts` & `double_entry_journals`) use double-entry constraint checks. The sum of debit balances must exactly equal credits:
   ```sql
   ALTER TABLE double_entry_journals
   ADD CONSTRAINT chk_double_entry_balance
   CHECK (debit_amount >= 0.00 AND credit_amount >= 0.00);
   ```
2. **Haircut Boundaries**: Settlement proposal haircut rates must stay within strict financial limits ($0.00\%$ to $100.00\%$):
   ```sql
   ALTER TABLE settlement_proposals
   ADD CONSTRAINT chk_proposed_haircut
   CHECK (haircut_percentage >= 0.00 AND haircut_percentage <= 100.00);
   ```
3. **Multi-Tenant Partition Check**: To prevent tenant leaks, every isolated entity includes `tenant_id` which acts as a composite partition/filtering key alongside primary IDs.

---

## 4. Disaster Recovery & Rollback Contingency

### Disaster Detection Criteria
1. Migrations execution lock holds exceeding $30$ seconds (detects table locks blocking application traffic).
2. API Error spikes exceed $2.5\%$ immediately post-migration.
3. Memory depletion or connection limits breached on database instances.

### Standard Rollback Script (SQL)
In case of deployment failure, execute the following clean script to restore system state instantly:

```sql
BEGIN;

-- Remove newly added columns and indexes safely without dropping populated columns
DROP INDEX IF EXISTS idx_audit_logs_tenant_timestamp;
DROP INDEX IF EXISTS idx_cases_active_tenant;
DROP INDEX IF EXISTS idx_gps_locations_employee_time;

-- Force terminate hanging locks on our application tables
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'edros_prod' AND pid <> pg_backend_pid();

-- Re-enable prior indexes if omitted
CREATE INDEX IF NOT EXISTS idx_users_email_old ON users(email);

COMMIT;
```
