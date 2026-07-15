# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-DEPLOY-004
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 4: NEON SERVERLESS POSTGRESQL SPEC

```
================================================================================
            N E O N   S E R V E R L E S S   P O S T G R E S Q L
                                    S P E C
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Principal Database Administrator & Architect
Co-Authors:   Lead Cloud Engineer, Senior Site Reliability Engineer
Reviewer:     Principal Platform Architect, Lead Compliance Officer
Approver:     Chief Technology Officer & Database Architecture Board
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline issue of the Neon Serverless PostgreSQL Spec for EDROS v1.0.0. | Principal DBA & Architect | CTO & Database Board |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [NEON SERVERLESS PLATFORM SPEC & ARCHITECTURAL MODEL](#2-neon-serverless-platform-spec--architectural-model)
3. [STORAGE-COMPUTE SEPARATION & COMPUTE AUTOSCALING](#3-storage-compute-separation--compute-autoscaling)
4. [DATABASE BRANCHING STRATEGY & LIFECYCLE](#4-database-branching-strategy--lifecycle)
5. [CONNECTION MANAGERS, PGBOUNCER & PORT TOPOGRAPHY](#5-connection-managers-pgbouncer--port-topography)
6. [SECURITY FRAMEWORK & HARDENING POLICIES](#6-security-framework--hardening-policies)
7. [SCHEMA BLUEPRINT & RECOVERY MODEL RELATIONSHIPS](#7-schema-blueprint--recovery-model-relationships)
8. [PERFORMANCE OPTIMIZATION, INDEXING & VACUUMING](#8-performance-optimization-indexing--vacuuming)
9. [BACKUP, POINT-IN-TIME RESTORE (PITR) & DISASTER RECOVERY](#9-backup-point-in-time-restore-pitr--disaster-recovery)
10. [COMMON ISSUES & DATABASE TROUBLESHOOTING](#10-common-issues--database-troubleshooting)
11. [VALIDATION CHECKLIST & SMOKE TESTING PROCEDURES](#11-validation-checklist--smoke-testing-procedures)
12. [GLOSSARY & REFERENCES](#12-glossary--references)
13. [APPENDIX](#13-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This specification defines the administrative standards, architectural design, security policies, and performance guidelines for the **Neon Serverless PostgreSQL** database layer within the Enterprise Debt Recovery Operating System (EDROS). This manual ensures zero data-loss resilience, sub-100ms query performance, and strict regulatory compliance with financial storage mandates.

### 1.2 Scope
This document governs all persistent relational storage infrastructure utilized by EDROS:
* **The Production Database Cluster:** Serverless compute scaling thresholds, connection pool allocations, and transactional isolation levels.
* **Database Branching Engines:** Creation, synchronization, testing, and merging of schema branches across environments.
* **Connection Multiplexers:** Direct vs. pooled connection endpoints (pgBouncer), pooling sizes, and SSL certificate integrations.
* **Storage and Compute Decoupling:** Safe-state caching, page-server performance, and cold-start mitigations.
* **Backup & PITR Policies:** Snapshot intervals, WAL log archivers, point-in-time recovery configurations, and emergency cross-region migrations.

### 1.3 Target Audience
This manual is written for:
* **Database Administrators (DBAs)** maintaining data structures, index optimization, and transactional safety.
* **Full-stack and Backend Developers** writing database queries, managing migrations, and executing schemas.
* **Site Reliability Engineers (SREs)** overseeing connection pool performance, latency metrics, and failovers.
* **Financial Auditors and Compliance Specialists** verifying compliance with physical security, encryption standards, and transactional logging mandates.

---

## 2. NEON SERVERLESS PLATFORM SPEC & ARCHITECTURAL MODEL

The database layer serves as the system of record for EDROS. In traditional setups, database servers must be sized for peak loads, leading to over-provisioning and wasted resources during off-peak hours. EDROS overcomes this inefficiency by using **Neon Serverless PostgreSQL**, which decouples storage from compute to provide horizontal and vertical flexibility.

### 2.1 Multi-Cloud Decoupled Storage Topology

```
                         [ Vercel Edge Portal / BFF ]
                                      │
                         [ Railway Worker Cluster ]
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼ (Port 5432: pooled connection)              ▼ (Port 5432: direct connection)
       [ pgBouncer Pooler ]                          [ Direct Admin Pool ]
               │                                             │
               └──────────────────────┬──────────────────────┘
                                      ▼ (Encrypted TLS 1.3 Tunnel)
                        [ Neon Compute Node (vCPU / RAM) ]
                          - Dynamic vertical auto-scaling
                          - Compute cache (local SSD)
                                      │
                        (Proprietary Network Protocol)
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
       [ Neon Safekeepers ]                          [ Neon Pageservers ]
         - Receives and acknowledges                   - Processes and caches WAL logs
           write-ahead logs (WAL)                      - Returns data pages on demand
         - Consensus-backed redundancy                 - Pushes cold pages to object store
               │                                             │
               └──────────────────────┬──────────────────────┘
                                      ▼
                        [ Cloudflare R2 / AWS S3 Storage ]
                          - Bottomless long-term page storage
                          - Cost-optimized persistence
```

### 2.2 Serverless Decoupled Architecture Components
* **Compute Nodes:** Temporary virtual machines running PostgreSQL database processes. Computes do not store data permanently; instead, they cache frequently accessed data pages on local SSDs and execute query workloads.
* **Safekeepers:** A quorum of lightweight, globally distributed services that receive write-ahead logs (WAL) from compute nodes, verify consistency, and acknowledge transaction commits before data is persisted.
* **Pageservers:** Compute-decoupled nodes that process WAL streams from safekeepers, re-construct block states, serve data pages on demand to computes, and push cold pages to bottomless cloud storage.
* **Bottomless S3-compatible Storage:** The ultimate storage tier. All data blocks are saved in durable object storage, ensuring near-infinite horizontal storage scaling without manual intervention.

---

## 3. STORAGE-COMPUTE SEPARATION & COMPUTE AUTOSCALING

Decoupled compute and storage allows EDROS to scale resources dynamically based on operational demand. During peak collection hours, database engines scale up instantly; during silent evening hours, compute blocks scale down or suspend to reduce costs.

### 3.1 Vertical Scaling Configurations
Neon compute nodes automatically scale CPU and RAM allocations based on active load:

```
┌─────────────────────────────────────────────────────────────┐
│                 NEON VERTICAL AUTOSCALING LIMITS            │
├───────────────────┬───────────────────┬─────────────────────┤
│ Environment Scope │ Minimum Allocation│ Maximum Allocation  │
├───────────────────┼───────────────────┼─────────────────────┤
│ Development (Dev) │ 0.25 CU (64MB)    │ 1.0 CU (256MB)      │
├───────────────────┼───────────────────┼─────────────────────┤
│ Staging (Stage)   │ 0.50 CU (128MB)   │ 2.0 CU (512MB)      │
├───────────────────┼───────────────────┼─────────────────────┤
│ Production (Prod) │ 1.00 CU (256MB)   │ 8.0 CU (2GB)        │
└───────────────────┴───────────────────┴─────────────────────┘
```
*Note: 1 CU (Compute Unit) is equivalent to 1 vCPU core and 256MB of RAM.*

### 3.2 Scaling Event Actions and Thresholds
* **Scale-Up Rule:** When active CPU or memory utilization across a compute node exceeds **85.00%** for 10 consecutive seconds, Neon instantly adds resources (up to the maximum limits) without dropping connections or restarting the database process.
* **Scale-Down Rule:** When active utilization drops below **20.00%** for 5 consecutive minutes, Neon gradually reduces compute allocation, freeing up resources.
* **Scale-to-Zero (Autosuspend):** For non-production environments (Dev & Staging), if there are zero active client connections for **15 minutes**, the compute node enters an inactive state (`SUSPENDED`). The bottomless storage remains intact.

### 3.3 Mitigating Cold Start Latency
When a suspended compute node receives a new request (a cold start), it must initialize and fetch metadata before returning data. This process can introduce a 1.5s latency spike.
To prevent this in production:
* **Autosuspend is strictly disabled** (`Compute Autosuspend = Off`) for the primary Production database branch. Compute resources are kept warm at a minimum of 1.0 CU.
* Active monitoring systems run periodic health checks on staging environments every 5 minutes to keep computes warm during active business hours (08:00 to 19:00).

---

## 4. DATABASE BRANCHING STRATEGY & LIFECYCLE

Because compute and storage are decoupled, Neon can clone database volumes near-instantly using **Database Branching**. Branching copies the database metadata catalog without duplicating raw physical blocks, allowing developers to create isolated, full-sized database clones for testing and schema migrations.

### 4.1 Database Branching Tree Model

```
                          [ Production Main Branch ]
                           - Immutable, warm-compute
                           - Port: 5432
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼ (Metadata snapshot clone)                   ▼
         [ Staging Branch ]                             [ Feature Dev Branch ]
           - Autosuspends: 15 mins                        - Ephemeral, scales to zero
           - Synced daily with main                       - Deleted post-validation
```

### 4.2 Database Branching Rules and Lifecycles
* **Development Branching:** Every developer working on a feature branch creates a dedicated database branch cloned from the parent branch. This provides an isolated environment containing complete schema layouts and anonymized sandbox records.
* **Branch Deletion:** Ephemeral database branches are deleted automatically when their corresponding pull requests are closed or merged.
* **Data Refresh Sync:** The Staging database branch is synchronized daily with the Production branch using a secure script. This script strips all Personally Identifiable Information (PII) and copies schemas to maintain testing accuracy.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Neon Branching Settings Console               |
| Capture the Neon Dashboard showing the active database branching tree,       |
| clearly labeling the relationship between 'main' and environmental branches.|
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 5. CONNECTION MANAGERS, PGBOUNCER & PORT TOPOGRAPHY

PostgreSQL handles connections by spawning an independent backend process for each client, which consumes approximately 10MB of RAM per connection. In serverless and containerized systems with hundreds of concurrent workers, this can exhaust server memory rapidly. EDROS mitigates this using Neon's integrated **pgBouncer** connection multiplexer.

### 5.1 Connection Endpoints & Port Schemas

```
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE CONNECTION TOPOGRAPHY              │
├───────────────────┬─────────────┬───────────┬───────────────┤
│ Endpoint Type     │ Port Schema │ Mode      │ Preferred Use │
├───────────────────┼─────────────┼───────────┼───────────────┤
│ Direct Endpoint   │ 5432        │ Session   │ Migrations    │
├───────────────────┼─────────────┼───────────┼───────────────┤
│ Pooled Endpoint   │ 5432        │ Transaction│ Web/Workers   │
└───────────────────┴─────────────┴───────────┴───────────────┘
```

#### 5.1.1 Direct Endpoint (Port 5432)
* **URL Syntax:** `postgres://[user]:[password]@[domain]/edros`
* **Characteristics:** Bypasses connection poolers, creating a dedicated database process.
* **Target Workloads:** Heavy analytical queries, direct schema migrations, and admin data seeding scripts.
* **Constraints:** Keep max connections below 20. Do not use inside stateless Edge or lambda functions.

#### 5.1.2 Pooled Endpoint (Port 5432 via Pooler Subdomain)
* **URL Syntax:** `postgres://[user]:[password]@[domain]-pooler/edros`
* **Characteristics:** Routes connections through pgBouncer in **Transaction Mode**. Connections are shared across queries, allowing the database to support up to 10,000 concurrent client sessions.
* **Target Workloads:** Stateful serverless functions, Vercel web apps, and Railway background workers.
* **Constraints:** Prepared statements are disabled. Client queries must rely on positional parameters.

---

## 6. SECURITY FRAMEWORK & HARDENING POLICIES

Due to the sensitivity of debt recovery records, the database layer must enforce strict access controls and encryption standards.

### 6.1 Cryptographic Policies and Access Hardening
* **Encryption in Transit:** All connections must use **SSL/TLS 1.3** encryption. Compute configurations enforce TLS handshakes, dropping non-encrypted connection attempts.
* **Encryption at Rest:** All pageservers and bottomless object stores are encrypted at rest using AES-256 keys managed via a secure Key Management Service (KMS).
* **Network Access Isolation:** Production compute nodes are accessible only via Cloudflare tunnels or authorized IP ranges (CIDR blocks matching Railway NAT gateways). Direct internet access is blocked.

### 6.2 SQL Privileges Matrix
* **`owner_role` (Migration Admin):** Grants complete read, write, alter, and truncate capabilities. Restricted to administrative tasks and managed migration runs.
* **`app_user` (Application Runtime):** Limited to `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on operational tables. Cannot modify table structures or execute raw administrative commands.
* **`read_only_analyst` (Reporting Role):** Grants read-only access (`SELECT`) to specific reporting tables. All Personally Identifiable Information (PII) tables are masked.

---

## 7. SCHEMA BLUEPRINT & RECOVERY MODEL RELATIONSHIPS

The database schema organizes case records, payments, audits, and operational state transitions. Relations use strict foreign key constraints to maintain referential integrity.

### 7.1 Schema Diagram & Entity Relationships

```
              ┌───────────────────────────┐
              │          TENANTS          │
              ├───────────────────────────┤
              │ pk: tenant_id             │
              │     name, status          │
              └─────────────┬─────────────┘
                            │ (1:N)
                            ▼
              ┌───────────────────────────┐
              │           CASES           │
              ├───────────────────────────┤
              │ pk: case_id               │
              │ fk: tenant_id             │
              │     debtor_name, balance  │
              └─────────────┬─────────────┘
                ┌───────────┴───────────┐
                │ (1:N)                 │ (1:N)
                ▼                       ▼
  ┌───────────────────────────┐   ┌───────────────────────────┐
  │       VISIT_LOGS          │   │         PAYMENTS          │
  ├───────────────────────────┤   ├───────────────────────────┤
  │ pk: log_id                │   │ pk: payment_id            │
  │ fk: case_id               │   │ fk: case_id               │
  │     latitude, longitude   │   │     amount, status        │
  └───────────────────────────┘   └───────────────────────────┘
```

### 7.2 Core Schema Fields and Constraints
* **`tenants`:** Tracks corporate banking organizations. Fields include `id` (primary key UUID), `name` (unique string), and `status` (active, suspended, deleted).
* **`cases`:** Stores individual debtor records. Columns include `id` (primary key UUID), `tenant_id` (foreign key pointing to tenants), `debtor_name` (encrypted string), and `balance` (numeric, default 0).
* **`visit_logs`:** Tracks physical check-ins logged by field agents. Columns include `id` (primary key UUID), `case_id` (foreign key pointing to cases), `timestamp` (UTC datetime), and `gps_coordinates` (geographic Point type).
* **`payments`:** Tracks transaction records. Columns include `id` (primary key UUID), `case_id` (foreign key pointing to cases), `amount` (numeric), `transaction_hash` (unique index), and `status` (pending, settled, rejected).

---

## 8. PERFORMANCE OPTIMIZATION, INDEXING & VACUUMING

To maintain sub-100ms response times on active dashboards during high-volume operations, the database employs standard indexing and maintenance routines.

### 8.1 Production Indexing Guidelines
* **Primary Key Indexes:** Created automatically for all UUID columns, ensuring fast row lookup.
* **Foreign Key Indexing:** Every foreign key column must have an associated index to speed up join operations and maintain referential integrity:

```sql
-- Speed up case searches and tenant filtering
CREATE INDEX idx_cases_tenant_id ON cases(tenant_id);

-- Speed up visit log history lookups for active cases
CREATE INDEX idx_visit_logs_case_id ON visit_logs(case_id);

-- Speed up payment audits and state changes
CREATE INDEX idx_payments_case_id ON payments(case_id);
```

* **Composite and Specialized Indexes:** Use partial and composite indexes to optimize common search patterns (e.g., searching for active cases with outstanding balances):

```sql
-- Optimize searches for active cases with outstanding balances
CREATE INDEX idx_cases_active_balance 
ON cases(tenant_id, balance) 
WHERE status = 'ACTIVE' AND balance > 0;
```

### 8.2 Automated Autovacuum Configurations
PostgreSQL does not overwrite updated or deleted rows directly; instead, it marks them as obsolete (dead tuples) to support transactional isolation. These dead tuples must be cleaned regularly using **Autovacuum** to free up storage space and prevent performance degradation.

Because Neon decoupled storage handles page reorganizations in the background, typical autovacuum workloads are reduced. However, to prevent catalog bloat, active computes enforce these settings:

```sql
ALTER SYSTEM SET autovacuum_max_workers = 5;
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.05; -- Trigger vacuum when 5% of tuples change
ALTER SYSTEM SET autovacuum_vacuum_threshold = 50;      -- Minimum changed rows to trigger vacuum
ALTER SYSTEM SET autovacuum_vacuum_cost_limit = 1000;   -- Allocate more resources to vacuum processes
```

---

## 9. BACKUP, POINT-IN-TIME RESTORE (PITR) & DISASTER RECOVERY

Traditional backups can lose hours of data between snapshots. EDROS mitigates this risk by leveraging Neon's continuous log-structured storage architecture to support precise, point-in-time recovery.

### 9.1 Continuous Wal Archiving & Snapshots
* **Continuous Logging:** Compute nodes stream all write-ahead logs (WAL) to safekeepers instantly. These logs are stored continuously in durable, bottomless cloud storage, ensuring a near-zero Recovery Point Objective (RPO).
* **Immutable Snapshots:** Neon generates hourly storage-level snapshots. These snapshots are immutable, protecting data from unauthorized modifications or ransomware attacks.

### 9.2 Point-In-Time Restore (PITR) Execution
If an administrative error or technical failure corrupts the database:
1. Identify the target timestamp (the exact second before the corruption occurred).
2. Open the **Neon Database Console**.
3. Go to **Branch Settings** and select **Create Branch from Point in Time**.
4. Specify the target timestamp and select the parent branch.
5. Neon creates a new, functional database branch containing the exact database state at that second, completing the recovery in under 5 seconds.
6. Verify the recovered branch's integrity before updating production DNS routes to point to the new branch.

```
                              [ Data Corruption Event ]
                                    (14:32:15 IST)
                                          │
                                          ▼
                         [ Select Target Restore Point ]
                                    (14:32:00 IST)
                                          │
                                          ▼
                        [ Create Branch From PITR (5s) ]
                          - Generates restored branch metadata
                          - Zero block duplication delay
                                          │
                                          ▼
                         [ Verify & Promote Branch ]
                          - Run integration checks
                          - Update application connection strings
```

---

## 10. COMMON ISSUES & DATABASE TROUBLESHOOTING

Stateless, serverless databases can encounter connection issues, scaling limits, or resource bottlenecks. This section outlines standard diagnostics and resolution procedures.

### 10.1 Active Connection Limits & Starvation
* **Symptom:** Clients receive connection errors: `Error: standard_con_setup: connection limit exceeded`.
* **Diagnostic Steps:**
  1. Check the active connection metrics in the Neon dashboard.
  2. Verify if clients use direct endpoints rather than pooled endpoints.
* **Resolution:** Ensure all non-migration workloads are configured to use pooled endpoints (`-pooler` subdomains) on port 5432, allowing pgBouncer to multiplex active connections.

### 10.2 Cold Start Latency Spikes
* **Symptom:** User dashboards experience a 1.5s delay during initial requests after periods of inactivity.
* **Diagnostic Steps:** Check compute node statuses in the Neon console. If the compute is in the `SUSPENDED` state, the delay is caused by a cold start.
* **Resolution:** Verify that autosuspend is disabled on the production branch. For staging environments, use automated health check scripts to keep compute nodes warm during core business hours.

### 10.3 Compute Auto-scaling Failures
* **Symptom:** Database queries slow down, and compute nodes fail to auto-scale under load.
* **Diagnostic Steps:** Check active CPU and memory metrics in the Neon console. Review configured scaling limits under **Compute Settings**.
* **Resolution:** Confirm that scaling limits are configured correctly. If load requirements exceed current thresholds, manually scale the maximum compute unit configuration (e.g., increase limits from 4 CU to 8 CU).

---

## 11. VALIDATION CHECKLIST & SMOKE TESTING PROCEDURES

SOP compliance requires the database team to run this manual verification checklist immediately after performing schema updates or environment changes:

```
+─────────────────────────────────────────────────────────────────────────────+
| PRODUCTION DATABASE VALIDATION SIGN-OFF SHEET                               |
|                                                                             |
| Target Branch:   [ Production Main Branch ]                                 |
| Schema Version:  [ Migration v1.4.2 ]                                       |
| DBA Sign-Off:    [ APPROVED / VERIFIED ]                                    |
| SRE Sign-Off:    [ APPROVED / MONITORING ]                                  |
+─────────────────────────────────────────────────────────────────────────────+
```

### 11.1 Post-Deployment Smoke Test Actions
* [ ] **Compute State Verification:** Confirm that the Production compute node is active, healthy, and autosuspend is disabled.
* [ ] **Pooled Connection Verification:** Verify that application services connect and query the database successfully using pooled endpoints on port 5432.
* [ ] **SSL Enforce Verification:** Attempt to connect without SSL certificates to confirm that the database drops unencrypted connection attempts.
* [ ] **Migration Ledger Check:** Query the migration ledger table (`drizzle.__drizzle_migrations`) to verify that all database updates applied successfully.
* [ ] **Autoscale Range Verification:** Confirm that scaling limits are configured correctly to support active peak-load requirements.

---

## 12. GLOSSARY & REFERENCES

### 12.1 Glossary of Terms
* **Compute Unit (CU):** A standardized resource allocation unit on Neon, equivalent to 1 vCPU core and 256MB of RAM.
* **pgBouncer:** A lightweight, high-performance connection pooler used to multiplex client sessions and reduce resource utilization on PostgreSQL servers.
* **PITR:** Point-In-Time Restore. A database recovery technique that restores database states to a precise historical timestamp.
* **WAL:** Write-Ahead Logging. A secure logging method where transactions are recorded sequentially in storage logs before they are written to data pages.
* **Consensus Quorum:** A majority agreement protocol used by safekeepers to verify and acknowledge write operations before they are committed to storage.

### 12.2 References
1. **Neon Serverless PostgreSQL Documentation:** Architecture, storage-compute decoupling, and branching models.
2. **PostgreSQL Manuals:** Transaction isolation levels, indexing strategies, and autovacuum configurations.
3. **Database Performance Best Practices (OWASP):** Guidelines for securing database schemas and managing connection pools.
4. **Reserve Bank of India (RBI) Regulations:** Data preservation and audit trails compliance directives for financial applications.

---

## 13. APPENDIX

### 13.1 Production Database Migration Log Template
Upon successful verification of a database schema migration, the executing DBA must record the deployment details using this structured template:

```
PRODUCTION DATABASE MIGRATION RECORD:
Migration ID:   MIG-NEON-2026-0402
Date Executed:  2026-07-15 05:00:00 UTC
Active Branch:  production-main
Target Schema:  v1.4.2 (Structured payments lookup update)
Duration:       2,450 ms (Zero-downtime execution)
State:          SUCCESSFUL (Post-migration verification completed)
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
