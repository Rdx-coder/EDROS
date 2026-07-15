# EDROS Banking & Debt Recovery Operating System
## SRE Runbook: High Availability & Disaster Recovery (DR) Plan

---

### 1. Architectural Governance & Overview
The Banking & Debt Recovery Operating System (EDROS) is a critical enterprise tier-0 application. This document serves as the official Site Reliability Engineering (SRE) Runbook for database replication, service failovers, continuous point-in-time recovery (PITR) procedures, and business continuity planning.

#### 1.1 Objectives
*   **Recovery Point Objective (RPO):** Maximum allowable data loss.
    *   *Transactional Data:* **< 5 minutes** (guaranteed via WAL shipping & streaming synchronous replication).
    *   *Document Store/Audit Trails:* **0 minutes** (guaranteed via S3 object versioning and cross-region replication).
*   **Recovery Time Objective (RTO):** Maximum allowable downtime for service restoration.
    *   *Critical Path Service Restorations:* **< 15 minutes** (via Kubernetes multi-zone replica failovers and secondary database promotion).

---

### 2. High Availability Infrastructure
EDROS implements a multi-region active-passive topology with real-time replication layers to ensure continuous operations under full-site blackouts.

```
                  [ GKE GLOBAL LOAD BALANCER ]
                               |
            +------------------+------------------+
            | (Active Region)                     | (Passive Region)
    [ PRIMARY GKE CLUSTER ]               [ STANDBY GKE CLUSTER ]
            |                                     |
    +-------+-------+                             +-------+-------+
    |               |                                     |
[API Pods]    [Worker Pods]                         [API Pods]    [Worker Pods]
    |               |                                     |
[REDIS REPLICA (MASTER)]                      [REDIS STANDBY REPLICA]
    |                                                     |
[POSTGRES PRIMARY] ===(WAL Streaming Replication)===> [POSTGRES HOT-STANDBY]
```

#### 2.1 Database Replication Setup
PostgreSQL uses a primary/standby architecture. All writes land on the primary node and are instantly streamed over TLS to hot standby instances in secondary availability zones:
*   **Primary Database (AWS RDS / Cloud SQL Developer):** Serves active read/write API endpoints.
*   **Replica Databases (Hot-Standby):** Serves read-only analytical loads and remains in state-synchronous alignment to take over primary operations immediately upon main node failure.

#### 2.2 Redis Cache / Queue High Availability
Redis is configured in Sentinel mode or as a multi-shard Redis Cluster with `appendonly yes` writing transaction changes to physical disks every second (`appendfsync everysec`).

---

### 3. Backup Strategy and Schedules

EDROS enforces a multi-tiered, encrypted, off-site backup regimen:

| Backup Tier | Frequency | Retention Period | Target Storage Class | Type |
| :--- | :--- | :--- | :--- | :--- |
| **Write-Ahead Logs (WAL)** | Continuous (5-min intervals) | 14 Days | AWS S3 Glacier Instant Retrieval | Point-in-Time Recovery (PITR) |
| **Logical SQL Dumps** | Daily (02:00 UTC) | 30 Days | S3 Standard (Geo-Replicated) | Standard SQL Recovery (`pg_dump`) |
| **Weekly Cold Backups** | Every Sunday | 1 Year | AWS S3 Deep Archive | Regulatory Audit / Vault |

---

### 4. Emergency Failover & Restoration Runbook

#### 4.1 Tier-1 Incident: PostgreSQL Database Failure
If the primary PostgreSQL database suffers catastrophic volume degradation or hardware isolation:

##### Step 1: Confirm DB Health Status
Verify connectivity issues from inside the cluster namespaces:
```bash
kubectl exec -it deployment/edros-backend -n edros-system -- pg_isready -h edros-db-service
```

##### Step 2: Promote Standby Database to Primary
If the primary database is determined to be non-recoverable, initiate Standby Database Promotion:
```bash
# Log in to the hot standby instance and promote it
pg_ctl promote -D /var/lib/postgresql/data
```
Verify the standby instance is now accepting write queries:
```sql
SELECT pg_is_in_recovery(); -- Must return false
```

##### Step 3: Shift Kubernetes Internal Service Pointers
Update the `edros-db-service` Endpoint mapping to point to the promoted database IP address:
```bash
kubectl apply -f devops/k8s/services.yaml
```

##### Step 4: Verify Application Stability
Force-restart API backend pods to drain persistent database pools and re-establish write handles:
```bash
kubectl rollout restart deployment/edros-backend -n edros-system
kubectl rollout status deployment/edros-backend -n edros-system --timeout=120s
```

---

#### 4.2 Tier-2 Incident: Database Disaster Recovery Restoration (Total Outage)
If physical state directories are corrupted across all master/standby nodes, execute a clean snapshot restoration using the backup CLI scripts.

##### Step 1: Put the Cluster in Maintenance Mode
Scale down API deployments to zero to prevent data corruption and race conditions:
```bash
kubectl scale deployment/edros-backend --replicas=0 -n edros-system
kubectl scale deployment/edros-worker --replicas=0 -n edros-system
```

##### Step 2: Pull the Most Recent Encrypted Backup from S3
```bash
aws s3 cp s3://edros-enterprise-vault-prod/backups/edros_production_backup_latest.sql.gz /tmp/latest_backup.sql.gz
```

##### Step 3: Run the DevOps Restoration Script
Execute the database restore script. This drops corrupt tables, regenerates schema configurations, and streams the SQL file.
```bash
./devops/scripts/db-restore.sh /tmp/latest_backup.sql.gz
```

##### Step 4: Run Post-flight Database Migrations
Ensure any outstanding Prisma migration definitions are applied:
```bash
./devops/scripts/db-migrate.sh
```

##### Step 5: Resume Cluster Operation Services
Restore standard traffic workloads by scaling application deployment targets back to default limits:
```bash
kubectl scale deployment/edros-backend --replicas=3 -n edros-system
kubectl scale deployment/edros-worker --replicas=2 -n edros-system
```

##### Step 6: Verify System Health & Audit Logs
Ensure the login and operations pathways are responsive:
```bash
curl -f https://edros.enterprise.internal/api/health
```

---

### 5. Annual Disaster Recovery Drill Checklist
To comply with regulatory audit requirements (SOC2 / ISO 27001), operations teams must perform simulated DR drills every 6 months.

*   [ ] **Simulate Host Disruption:** Force-terminate the primary database container while processing 10,000 synthetic queue items.
*   [ ] **Validate Auto-Failover Time:** Check that replication Sentinel promoted the standby replica within 60 seconds.
*   [ ] **Validate Zero-Data Loss:** Confirm all 10,000 background transactions successfully completed processing with zero errors or dropped entries.
*   [ ] **Verify off-site archival syncs:** Verify S3 cross-region geo-replication buckets contains identical cryptographically matching archives.
