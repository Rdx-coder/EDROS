# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-DEPLOY-003
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 3: RAILWAY WORKER & BULLMQ ENGINE GUIDE

```
================================================================================
          R A I L W A Y   W O R K E R   &   B U L L M Q   E N G I N E
                                   G U I D E
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Principal Backend Architect
Co-Authors:   Lead DevOps Engineer, Senior SRE
Reviewer:     Principal Site Reliability Engineer, Lead Cloud Security Engineer
Approver:     Chief Technology Officer & Architecture Steering Committee
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline issue of the Railway Worker & BullMQ Engine Guide for EDROS v1.0.0. | Principal Backend Architect | CTO & Architecture Steering Committee |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [OVERVIEW OF RAILWAY & BULLMQ ARCHITECTURE](#2-overview-of-railway--bullmq-architecture)
3. [BULLMQ QUEUE DESIGN AND TOPOLOGY](#3-bullmq-queue-design-and-topology)
4. [ENVIRONMENT VARIABLES & SECURITY REGISTRY](#4-environment-variables--security-registry)
5. [SYSTEM DEPLOYMENT ON RAILWAY](#5-system-deployment-on-railway)
6. [CRON SCHEDULER & RECURRING TASKS](#6-cron-scheduler--recurring-tasks)
7. [FAILSAFE PATTERNS & RETRY POLICIES](#7-failsafe-patterns--retry-policies)
8. [SCALING, CONCURRENCY & THREAD POOLS](#8-scaling-concurrency--thread-pools)
9. [MONITORS, TELEMETRY & ALERTS](#9-monitors-telemetry--alerts)
10. [TROUBLESHOOTING & DISASTER RECOVERY](#10-troubleshooting--disaster-recovery)
11. [VALIDATION CHECKLIST & SYSTEM SMOKE TESTING](#11-validation-checklist--system-smoke-testing)
12. [FAQ SECTION](#12-faq-section)
13. [GLOSSARY & REFERENCES](#13-glossary--references)
14. [APPENDIX](#14-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This guide establishes the definitive deployment, configuration, and monitoring procedures for the asynchronous background processing layer of the Enterprise Debt Recovery Operating System (EDROS). Utilizing **Railway** as the primary serverless-first compute engine and **BullMQ** (powered by Upstash Redis) as the enterprise queue controller, this document outlines how background workers run heavy computations, manage retries, handle media compression, and enforce operational time-locks.

### 1.2 Scope
This document governs all long-running, asynchronous, and scheduled workflows running outside Vercel's edge environment:
* **The Railway Compute Cluster:** Provisioning, Dockerfile setups, container lifecycle, and CPU/RAM allocation standards.
* **BullMQ Queue Infrastructure:** Active queues, worker thread-pools, job priority schemas, and Redis connection multiplexers.
* **Heavy Compute Workloads:** On-the-fly photo watermarking, visit coordinate geofencing validation, and invoice/receipt PDF encryption.
* **Cron Orchestration:** Scheduled routines executing timezone-compliant data transfers and temporal locks.

### 1.3 Target Audience
This manual is written for:
* **Backend and Core Systems Engineers** maintaining the asynchronous job engines and worker microservices.
* **DevOps Specialists and SREs** responsible for service scaling, health checks, environment variables, and container stability.
* **Risk and Compliance Officers** verifying database consistency, secure audit trail compilation, and data security policies.

---

## 2. OVERVIEW OF RAILWAY & BULLMQ ARCHITECTURE

In high-velocity debt recovery systems, some tasks are too heavy or take too long to run inside Edge Middleware or standard serverless routes. To keep client interfaces responsive and prevent timeout errors, EDROS uses a decoupled, event-driven worker model.

### 2.1 Decoupled Asynchronous Processing Topography
Vercel Edge functions capture user interactions, validate requests, and push task metadata to an intermediate Upstash Redis queue. Independent, long-running NodeJS containers hosted on Railway consume and process these tasks, saving results directly to Neon PostgreSQL.

```
                  [ Vercel Edge Portal / BFF API ]
                                │
               (JSON HTTP POST) │ (Sub-millisecond write)
                                ▼
                   [ Upstash Serverless Redis ]
                      ├── Queue: outreach-notifications
                      ├── Queue: photo-processing
                      └── Queue: pdf-generation
                                │
                                ▼ (Distributed Job Event)
              [ Railway Worker Cluster (Docker / PM2) ]
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  [ Worker Node 1 ]       [ Worker Node 2 ]       [ Worker Node 3 ]
   - PDF Generation        - GPS Geofencing        - Photo Processor
   - RC4 Encryption        - Audit Logging         - Watermarking
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                  [ Neon Serverless PostgreSQL ]
                    (State: Checked-In / Settled)
```

### 2.2 Core Component Descriptions
* **Upstash Serverless Redis (Queue Broker):** Serves as the low-latency, resilient transport layer. It persists active queues, handles client connections, and supports the atomic transactions needed by BullMQ.
* **Railway Compute Engine (Worker Host):** Executes long-running Docker containers with zero cold starts, automatic health checks, and secure container networking.
* **BullMQ (Job Manager):** A robust NodeJS queuing library that manages job states, retry logic, concurrency limits, priority scheduling, and cron-like recurring triggers.

---

## 3. BULLMQ QUEUE DESIGN AND TOPOLOGY

EDROS groups background tasks into specialized queues to prevent heavy file compression operations from blocking time-sensitive outreach notifications or transaction processing.

### 3.1 Production Queues and Priority Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EDROS BULLMQ QUEUE MATRIX                             │
├──────────────────────┬──────────┬──────────────┬────────────────────────────┤
│ Queue Name           │ Priority │ Concurrency  │ Maximum Processing Timeout │
├──────────────────────┼──────────┼──────────────┼────────────────────────────┤
│ `outreach-alerts`    │ Critical │ 50 Workers   │ 10,000 ms                  │
├──────────────────────┼──────────┼──────────────┼────────────────────────────┤
│ `geofence-validation`│ High     │ 30 Workers   │ 15,000 ms                  │
├──────────────────────┼──────────┼──────────────┼────────────────────────────┤
│ `photo-processing`   │ Medium   │ 10 Workers   │ 45,000 ms                  │
├──────────────────────┼──────────┼──────────────┼────────────────────────────┤
│ `pdf-generation`     │ Low      │ 5 Workers    │ 60,000 ms                  │
└──────────────────────┴──────────┴──────────────┴────────────────────────────┘
```

#### 3.1.1 `outreach-alerts` (Critical Priority)
Processes real-time SMS, email, and automated phone notifications sent to field executives and borrowers.
* **Business SLA:** Delivery confirmation must complete within 5 seconds of event trigger.
* **Failure Impact:** High. Delayed notifications can lead to duplicate contact attempts, violating compliance rules.

#### 3.1.2 `geofence-validation` (High Priority)
Receives GPS coordinates submitted by mobile clients, validates the check-in position against target debtor coordinates, and updates the case ledger.
* **Business SLA:** Validation and ledger update must complete within 10 seconds.
* **Failure Impact:** High. Delays cause field agent check-ins to hang, disrupting active routes.

#### 3.1.3 `photo-processing` (Medium Priority)
Receives raw field check-in images, applies watermarks (GPS coordinates, timestamp, operator ID), and uploads the compressed JPEG assets to Cloudflare R2 object storage.
* **Business SLA:** Processing must complete within 30 seconds of upload.
* **Failure Impact:** Medium. Causes minor delays in real-time supervisor audit dashboards.

#### 3.1.4 `pdf-generation` (Low Priority)
Generates PDF settlement agreements, collection invoices, and daily bank deposit receipts. It encrypts documents with RC4 before saving them to Cloudflare R2.
* **Business SLA:** Document compilation must complete within 60 seconds.
* **Failure Impact:** Low. Temporarily delays non-real-time financial audits.

---

## 4. ENVIRONMENT VARIABLES & SECURITY REGISTRY

Railway workers require administrative credentials to connect securely to PostgreSQL, Redis, and storage buckets. Because workers operate in a non-public environment behind Railway's internal private network, they can access sensitive infrastructure strings directly.

### 4.1 Secret Management and KMS
All variables must be defined in the Railway project dashboard. Secrets are encrypted using Railway’s integrated Key Management Service (KMS) and injected as secure environment variables at container startup.

### 4.2 Worker Environment Registry

| Variable Name | Environment Scope | Exposure Level | Purpose / Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Production / Staging | Server-Side | Configures NodeJS runtime performance (`production`). |
| `DATABASE_URL` | Production / Staging | Server-Side | Direct PostgreSQL connection string (bypasses pgBouncer). |
| `REDIS_URL` | Production / Staging | Server-Side | Primary connection URL for the Upstash Redis queue. |
| `UPSTASH_REDIS_REST_TOKEN` | Production / Staging | Server-Side | REST token for non-Socket Redis commands. |
| `CLOUDFLARE_R2_ACCESS_KEY` | Production / Staging | Server-Side | R2 access key used to write and watermark visit media. |
| `CLOUDFLARE_R2_SECRET_KEY` | Production / Staging | Server-Side | R2 secret key used to upload receipts and PDF documents. |
| `BULLMQ_CONCURRENCY` | Production / Staging | Server-Side | Maximum parallel job threads running on an individual container. |
| `BULLMQ_PREFETCH_LIMIT` | Production / Staging | Server-Side | Controls the number of jobs prefetched from Upstash. |
| `ENCRYPTION_KEY_SECRET` | Production / Staging | Server-Side | Primary key used to encrypt PII data in the local database. |

> **CRITICAL SECURITY NOTE:** Never reuse developer sandbox database URLs or Upstash credentials in the production Railway container cluster. Doing so can mix operational environments and invalidate transaction audits.

---

## 5. SYSTEM DEPLOYMENT ON RAILWAY

EDROS uses a container-first deployment model on Railway. The backend code compiles to clean NodeJS bytecode, packaged in a hardened Alpine container image.

### 5.1 Deployment Pipeline Configuration
Whenever changes are merged into the main branch of the EDROS repository, a webhook triggers Railway to build and roll out the update:

```
[ Git Push to Main Branch ] ──► [ GitHub Webhook Trigger ]
                                           │
                                           ▼
                                [ Railway Container Builder ]
                                  ├── Pull Alpine Node-20 Base
                                  ├── Run TypeScript Compilation
                                  └── Create Hardened Image
                                           │
                                           ▼
                                [ Rolling Update Rollout ]
                                  ├── Spin up new worker container
                                  ├── Verify Health Check (/health)
                                  └── Scale down old container
```

### 5.2 Hardened Dockerfile: `worker.Dockerfile`
This optimized Dockerfile minimizes image size and enforces security controls, running background workers under a non-root service account:

```dockerfile
# Stage 1: Build Workspace
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install compilation tools
RUN apk add --no-cache python3 make g++

# Copy package descriptors
COPY package*.json ./
RUN npm ci

# Copy source tree and compile TypeScript
COPY . .
RUN npm run build

# Stage 2: Runtime Production Container
FROM node:20-alpine AS runner

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install light image library dependencies for watermarking
RUN apk add --no-cache sharp

# Copy build output and production dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist

# Create a non-privileged system user for process execution
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestuser -u 1001
RUN chown -R nestuser:nodejs /usr/src/app
USER nestuser

EXPOSE 3000

# Launch background worker using node binary
CMD ["node", "dist/worker-entry.js"]
```

### 5.3 Service Capacity Allocation Profiles
To prevent resource starvation or container termination by the Out-Of-Memory (OOM) killer, Railway services must be configured with matching resource profiles:

```
┌─────────────────────────────────────────────────────────────┐
│                 RAILWAY CONTAINER LIMITS                    │
├───────────────────┬─────────────────────────────────────────┤
│ CPU Allocation    │ 0.5 vCPU Core                           │
├───────────────────┼─────────────────────────────────────────┤
│ RAM Allocation    │ 512 MB Standard (Scales up to 1GB)      │
├───────────────────┼─────────────────────────────────────────┤
│ Restart Policy    │ On-Failure, max 5 consecutive retries   │
├───────────────────┼─────────────────────────────────────────┤
│ Health Check Path │ /api/health (Port 3000)                 │
└───────────────────┴─────────────────────────────────────────┘
```

---

## 6. CRON SCHEDULER & RECURRING TASKS

In addition to processing real-time events, BullMQ handles scheduled recurring tasks. These tasks run using standard cron expressions configured within the main worker instance.

### 6.1 Recurring Task Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EDROS RECURRING JOB REGISTRY                          │
├───────────────────┬─────────────────┬───────────────────────────────────────┤
│ Job Identifier    │ Cron Schedule   │ Execution Purpose                     │
├───────────────────┼─────────────────┼───────────────────────────────────────┤
│ `rbi-hour-lock`   │ `0 19 * * *`    │ Locks all mobile operations at 19:00  │
├───────────────────┼─────────────────┼───────────────────────────────────────┤
│ `rbi-hour-unlock` │ `0 8 * * *`     │ Unlocks mobile operations at 08:00    │
├───────────────────┼─────────────────┼───────────────────────────────────────┤
│ `roster-sync`     │ `0 7 * * *`     │ Synchronizes scheduled rosters        │
├───────────────────┼─────────────────┼───────────────────────────────────────┤
│ `stagnancy-alerts`│ `0 21 * * *`    │ Flags cases with zero visits logged   │
└───────────────────┴─────────────────┴───────────────────────────────────────┘
```

#### 6.1.1 `rbi-hour-lock` (Enforced daily at 19:00 IST)
Updates active case registers and user profiles, setting the operational time lock to `LOCKED`. This prevents mobile apps from accessing debtor details or recording check-ins outside of permitted hours.

#### 6.1.2 `stagnancy-alerts` (Enforced daily at 21:00 IST)
Scans active cases in the database, identifying accounts that have had zero physical or phone contact attempts for 14 days. These cases are flagged for regional rebalancing.

---

## 7. FAILSAFE PATTERNS & RETRY POLICIES

Asynchronous systems must handle intermittent failures gracefully. If a database connection drops or an external SMS gateway times out, jobs must retry automatically without duplicating transactions.

### 7.1 Job Execution and Retry Flow

```
                     [ Job Triggered in Upstash Redis ]
                                     │
                                     ▼
                        [ BullMQ Worker Execution ]
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼ (Success)                             ▼ (Exception Thrown)
         [ Complete Job ]                      [ Determine Retry Count ]
         - Move to "completed"                           │
         - Log execution metrics                         ├───────────────────────┐
                                                         ▼ (< Max Retries)       ▼ (>= Max Retries)
                                                 [ Schedule Retry ]       [ Move to Dead Letter ]
                                                 - Exponential backoff    - Status: "failed"
                                                 - Try again later        - Send critical alert
```

### 7.2 Code Reference: BullMQ Queue Options Configuration
This production-grade TypeScript configuration defines strict retry limits and exponential backoff parameters:

```typescript
import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";

const redisConnection = new IORedis(process.env.REDIS_URL || "", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Configure default queue parameters
export const defaultQueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5, // Retry up to 5 times before failing
    backoff: {
      type: "exponential",
      delay: 5000, // Wait 5s before first retry, then 10s, 20s, etc.
    },
    removeOnComplete: {
      age: 3600 * 24, // Keep completed job logs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 3600 * 24 * 7, // Keep failed job logs for 7 days
    },
  },
};

// Queue instance initialization
export const geofenceQueue = new Queue("geofence-validation", defaultQueueOptions);
```

---

## 8. SCALING, CONCURRENCY & THREAD POOLS

To handle sudden spikes in field check-ins (which typically peak between 09:00 and 11:00 and between 17:00 and 19:00), the worker cluster must optimize concurrency and manage system resources efficiently.

### 8.1 Multi-Core Worker Clustering
By default, NodeJS runs in a single-threaded event loop. If a worker handles CPU-heavy tasks (like generating encrypted PDFs or watermarking raw high-resolution JPEGs) on the main thread, it can block network I/O and delay other active queues.

To avoid this, EDROS workers handle CPU-heavy jobs inside isolated worker thread pools:

```typescript
// Worker setup using cluster module or separate child threads
import { Worker } from "bullmq";
import path from "path";

// Allocate worker processors to separate files to run in isolated processes
const processorPath = path.join(__dirname, "processors", "pdf-generator.js");

const pdfWorker = new Worker("pdf-generation", processorPath, {
  connection: redisConnection,
  concurrency: parseInt(process.env.BULLMQ_CONCURRENCY || "5", 10),
  useWorkerThreads: true, // Run jobs in a multi-threaded pool to keep main loop free
});

pdfWorker.on("failed", (job: Job | undefined, err: Error) => {
  console.error(`PDF compilation failed for job ${job?.id}:`, err);
});
```

### 8.2 Horizontally Scaling Railway Services
* When average CPU usage across active Railway containers exceeds **80.00%** for 3 consecutive minutes, Railway's horizontal autoscaler provisions an additional container instance.
* Dynamic container registration allows new workers to connect to Upstash Redis and start processing queued jobs immediately, reducing wait times during peak hours.

---

## 9. MONITORS, TELEMETRY & ALERTS

Maintaining visibility into background queues is critical for SLA compliance. SRE teams monitor queue health, processing latency, and failure rates in real time.

### 9.1 Prometheus metrics Endpoint Schema
Every Railway worker service exposes a standard Prometheus endpoint at `/metrics`. Prometheus polls this endpoint every 15 seconds to collect operational metrics:

```
# HELP edros_queue_active_jobs_count Current count of active jobs in the queue
# TYPE edros_queue_active_jobs_count gauge
edros_queue_active_jobs_count{queue="geofence-validation"} 3
edros_queue_active_jobs_count{queue="photo-processing"} 12

# HELP edros_job_processing_duration_seconds Time taken to execute an individual task
# TYPE edros_job_processing_duration_seconds histogram
edros_job_processing_duration_seconds_bucket{queue="geofence-validation", le="2.0"} 124
edros_job_processing_duration_seconds_bucket{queue="geofence-validation", le="5.0"} 412
edros_job_processing_duration_seconds_bucket{queue="geofence-validation", le="+Inf"} 415

# HELP edros_job_failure_total Cumulative count of failed jobs in the environment
# TYPE edros_job_failure_total counter
edros_job_failure_total{queue="outreach-alerts", reason="gateway_timeout"} 4
```

### 9.2 Critical Alerting Rules (PagerDuty / Slack)
The monitoring system triggers critical alerts when operations breach these performance thresholds:

```
┌─────────────────────────────────────────────────────────────┐
│                   ALERTS & SLA BREACHES                     │
├───────────────┬───────────────────┬─────────────────────────┤
│ Condition     │ Trigger Limit     │ Incident Severity       │
├───────────────┼───────────────────┼─────────────────────────┤
│ Queue Backlog │ > 200 Pending     │ Warning (Slack Alert)   │
├───────────────┼───────────────────┼─────────────────────────┤
│ Job Latency   │ > 45,000 ms       │ High (SRE PagerDuty)    │
├───────────────┼───────────────────┼─────────────────────────┤
│ Failure Rate  │ > 5.00% Failed    │ Critical (C-Suite Page) │
└───────────────┴───────────────────┴─────────────────────────┘
```

---

## 10. TROUBLESHOOTING & DISASTER RECOVERY

This section outlines standard diagnostics and emergency procedures for managing queue failures and system degradations.

### 10.1 Stuck Jobs & Thread Lockups
* **Symptom:** Jobs remain in the `active` state indefinitely, causing queue backlogs and resource starvations.
* **Diagnostic Steps:**
  1. Open the **BullMQ Admin Dashboard** or run Redis CLI queries to identify stuck job IDs.
  2. Inspect container CPU logs. If CPU usage is pegged at 100% on a single thread, the worker may be stuck in an infinite loop or blocked by a synchronous file operation.
* **Resolution:** 
  1. Force-restart the stuck container via the Railway CLI or dashboard.
  2. Implement an operational watchdog timer using BullMQ's `lockDuration` and `stalledInterval` options to automatically identify and restart stalled jobs.

### 10.2 Database Connection Pool Exhaustion
* **Symptom:** Workers report database connection timeouts: `Error: timeout exceeded when acquiring connection from pool`.
* **Diagnostic Steps:**
  1. Check active database connection counts in the Neon PostgreSQL console.
  2. Verify that workers release database connections promptly and do not leave connections open during delayed operations.
* **Resolution:**
  1. Limit connection pool sizes in the worker's database configuration: e.g., set `max: 5` connections per worker thread.
  2. Route non-transactional database queries through pgBouncer connection pool endpoints.

### 10.3 Upstash Redis Rate-Limit Exhaustion
* **Symptom:** Workers report Redis connection errors: `Error: Rate limit exceeded on Upstash Redis`.
* **Diagnostic Steps:**
  1. Open the Upstash console and check active request volumes against subscription limits.
  2. Check for "hot loops" in the worker code (e.g., rapid state polling or high-frequency job queries).
* **Resolution:**
  1. Increase the Upstash Redis subscription tier or scale the rate limits.
  2. Use BullMQ's `limiter` options to rate-limit job execution at the queue level, matching processing rates to Upstash subscription limits.

---

## 11. VALIDATION CHECKLIST & SYSTEM SMOKE TESTING

SOP compliance requires the SRE team to run this manual verification checklist immediately after promoting any production release:

```
+─────────────────────────────────────────────────────────────────────────────+
| PRODUCTION WORKER VALIDATION SIGN-OFF SHEET                                 |
|                                                                             |
| Target Service: [ Railway Worker Cluster ]                                  |
| Image Hash:     [ sha256:d8c7b6a5f4... ]                                    |
| Deployer:       [ senior_sre@sanjay.com ]                                   |
| Sign-Off:       [ APPROVED / DEPLOYED ]                                     |
+─────────────────────────────────────────────────────────────────────────────+
```

### 11.1 Post-Deployment Smoke Test Actions
* [ ] **Container Status Verification:** Confirm that all scheduled Railway containers are online and reporting `HEALTHY` status.
* [ ] **Redis Connection Handshake:** Verify that worker logs confirm successful connections to Upstash Redis pools.
* [ ] **Database Connection Check:** Verify that workers connect to production database schemas successfully.
* [ ] **Mock Job Submission:** Submit a test job (e.g., a test geofence validation request) to confirm the queue processes, completes, and records the job state successfully.
* [ ] **Prometheus Metrics Check:** Verify the `/metrics` endpoint is online and serves active metrics.

---

## 12. FAQ SECTION

#### Q1: Why does EDROS host background workers on Railway instead of running them on Vercel?
Vercel Edge and Serverless functions have strict execution time limits (typically 10 to 15 seconds) and cannot run long-running background tasks. Railway provides stable, non-root NodeJS container environments designed to run continuous background queues without timeout limits.

#### Q2: What happens if Upstash Redis goes offline?
If the queue broker goes offline, active jobs remain cached in local worker memory pools, and the system pauses queue submissions. Once Redis connectivity is restored, workers re-synchronize and resume processing active queues without losing data.

#### Q3: How are geofence validation calculations protected against tampering?
Geofence coordinate calculations execute entirely server-side within the secure Railway container network. Mobile clients only submit raw GPS coordinates, which the worker validates against immutable coordinates saved in Neon PostgreSQL.

---

## 13. GLOSSARY & REFERENCES

### 13.1 Glossary of Terms
* **BullMQ:** A robust, Redis-backed queuing library used to manage asynchronous job lifecycles in NodeJS applications.
* **Upstash:** A serverless Redis provider that provides low-latency, socket-based connection pools for distributed queuing systems.
* **OOM Killer:** Out-Of-Memory Killer. An automated Linux kernel process that terminates container tasks when they exceed memory allocations.
* **DLQ:** Dead-Letter Queue. A specialized queue used to isolate failed, unprocessable, or expired jobs for manual audit.
* **SLA:** Service Level Agreement. Predefined targets for response, processing, and system resolution times.

### 13.2 References
1. **BullMQ Core Documentation:** Queue configurations, thread pools, and retry policies.
2. **Railway Container Deployment Guide:** Designing secure, production-grade Docker environments.
3. **Upstash Redis Documentation:** Managing connection pools and configuring rate limits.
4. **OWASP Container Security Standards:** Hardening NodeJS environments and managing non-root service accounts.

---

## 14. APPENDIX

### 14.1 Production Worker Launch Log Template
Upon successful verification of a worker release, the deploying engineer must log the service details using this structured template:

```
PRODUCTION WORKER SERVICE LAUNCH RECORD:
Launch ID:      LNCH-RAIL-2026-0601
Date Logged:    2026-07-15 04:00:00 UTC
Service Target: Railway Worker Container Node 1
Image Hash:     sha256:4f3e2d1c0b9a8f
Active Queues:  outreach-alerts, geofence-validation, photo-processing
Status:         ONLINE & MONITORING (Smoke testing completed)
System Load:    0.15 Average CPU, 120MB Memory Footprint
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
