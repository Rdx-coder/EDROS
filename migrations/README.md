# EDROS Database Migration & Schema Management Strategy

Enterprise banking systems require **Zero-Downtime database migrations** and absolute auditability. EDROS integrates standard incremental migration versioning tools (e.g., Flyway, Liquibase, or Drizzle-kit) aligned with relational database management systems.

## 1. Core Principles

- **No Manual Schema Modifications**: Any modification to tables, indexes, views, or functions MUST be written as a versioned SQL migration script.
- **Backward-Compatible Changes**: All migrations MUST be designed to be backward compatible so that active older server nodes can operate alongside updated nodes during a rolling deploy (e.g., add columns before code uses them; never drop columns in the same deployment they are retired).
- **Automated Execution via CI/CD**: Migrations are applied automatically as part of the containerized start-up health check or as a pre-deploy action in the deployment pipeline.

## 2. Directory Layout

```
/migrations
  ├── README.md               # Strategy Guidelines
  ├── 0001_create_edros_schema.sql  # Initial baseline DDL
  └── 0002_add_index_outstanding.sql # Example subsequent optimization script
```

## 3. Database Migration Lock Engine

When running multiple containerized server nodes, only ONE container should run migrations at a time. The runner utilizes database-level transactional locks (such as PostgreSQL advisory locks) to prevent race conditions during schema updates:

```sql
-- Acquire session-level advisory lock
SELECT pg_advisory_lock(71420261127);

-- [Apply Migrations inside a transaction]

-- Release session-level advisory lock
SELECT pg_advisory_unlock(71420261127);
```

## 4. Rollback Protocols

Each schema migration script must have a corresponding rollback strategy defined in its documentation header. However, **auto-rollback is strictly forbidden in production systems**; if a migration fails or corrupts state, the correction must be applied as a *forward-rolling hotfix* (`0003_hotfix_fix_index.sql`) rather than an automated database rollback, ensuring no data generated during the deploy window is deleted or mangled.
