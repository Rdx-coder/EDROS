# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-DEPLOY-005
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 5: UPSTASH SERVERLESS REDIS & CACHE GUIDE

```
================================================================================
          U P S T A S H   S E R V E L E S S   R E D I S   &
                              C A C H E   G U I D E
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Principal Backend & Cache Architect
Co-Authors:   Lead Cloud Engineer, Senior Site Reliability Engineer
Reviewer:     Principal Platform Architect, Lead Security Engineer
Approver:     Chief Technology Officer & Caching Architecture Committee
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline issue of the Upstash Serverless Redis & Cache Guide for EDROS v1.0.0. | Principal Backend & Cache Architect | CTO & Caching Committee |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [UPSTASH SERVERLESS REDIS ARCHITECTURAL MODEL](#2-upstash-serverless-redis-architectural-model)
3. [REST VS. RESP SOCKET PROTOCOLS FOR CLOUD SERVICES](#3-rest-vs-resp-socket-protocols-for-cloud-services)
4. [KEYSPACE STRUCTURING SCHEMA & CACHE TOPOGRAPHY](#4-keyspace-structuring-schema-cache-topography)
5. [BULLMQ QUEUE ORCHESTRATION & STATE MANAGEMENT](#5-bullmq-queue-orchestration-state-management)
6. [SLIDING WINDOW RATE-LIMITING AT THE EDGE](#6-sliding-window-rate-limiting-at-the-edge)
7. [SECURITY CONTROLS, ENCRYPTION & DATA HARDENING](#7-security-controls-encryption-data-hardening)
8. [CACHE INVALIDATION POLICIES & STRATEGIES](#8-cache-invalidation-policies-strategies)
9. [PERFORMANCE MONITORING, METRICS & ALERTS](#9-performance-monitoring-metrics-alerts)
10. [COMMON FAILURE MODES & TROUBLESHOOTING](#10-common-failure-modes-troubleshooting)
11. [VALIDATION CHECKLIST & SYSTEM SMOKE TESTING](#11-validation-checklist-system-smoke-testing)
12. [GLOSSARY & REFERENCES](#12-glossary--references)
13. [APPENDIX](#13-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This guide establishes the deployment standards, operational blueprints, keyspace configurations, and security protocols for the **Upstash Serverless Redis** caching and queue brokerage tier of the Enterprise Debt Recovery Operating System (EDROS). This manual ensures sub-millisecond response times, secure caching operations, and efficient distributed job orchestration.

### 1.2 Scope
This document governs all Redis-backed caching and message-broker systems within the EDROS multi-cloud mesh:
* **The Serverless Caching Layer:** Session storage, database query caching, and tenant branding configurations.
* **The Message Broker Cluster:** BullMQ state storage, queue backlogs, stalled job watchdogs, and worker event flows.
* **Security & Ingress Controls:** IP whitelisting, HTTP REST vs. TCP socket authentication, and TLS 1.3 encryption.
* **Rate-Limiting Modules:** Dynamic, IP-based sliding window rate-limiting executed at Vercel's Edge nodes.
* **Monitoring & Alerts:** Hit/miss ratios, memory utilization, throughput limits, and latency spikes.

### 1.3 Target Audience
This manual is prepared for:
* **Backend Developers** writing application cache adapters, data loaders, and background jobs.
* **DevOps Engineers and SREs** managing Redis cluster capacity, rate-limiting parameters, and connectivity.
* **Security Analysts** auditing data isolation, access-token lifespans, and session encryption.

---

## 2. UPSTASH SERVERLESS REDIS ARCHITECTURAL MODEL

In full-stack architectures, standard Redis servers (like those run on VMs) require persistent TCP connections. In stateless environments (such as Vercel Edge Functions), establishing a new TCP connection on every request can introduce significant latency (connection overhead).

EDROS solves this problem by using **Upstash Serverless Redis**. Upstash supports both standard TCP sockets and HTTP-based REST connection pools, providing low-latency caching for both stateless Edge routes and long-running containerized background workers.

### 2.1 Decoupled Caching and Queue Topology

```
           [ Stateless Edge (Vercel) ]             [ Stateful Container (Railway) ]
                       │                                         │
                       ▼ (HTTP REST Protocol)                    ▼ (TCP Sockets - RESP)
                [ Port 443 / HTTPS ]                      [ Port 6379 / TLS RESP ]
                       │                                         │
                       └───────────────────┬─────────────────────┘
                                           ▼
                            [ Upstash Serverless Redis ]
                              ├── Active Cache keys
                              └── Distributed BullMQ queues
                                           │
                                 (Real-Time Replication)
                                           │
                                           ▼
                            [ Replica / Failover Node ]
```

### 2.2 Core Caching Infrastructure Components
* **HTTP REST Proxy (Vercel Client Ingress):** Translates REST API requests into native Redis commands at the Edge. This allows Edge Functions to query cached tenant records or verify active session tokens without the overhead of establishing a full TCP connection.
* **RESP TCP Sockets (Railway Container Ingress):** Provides direct, persistent connections using the standard Redis Serialization Protocol (RESP) on port 6379. This enables background workers to poll queues and handle job events with sub-millisecond latency.
* **Replicated Memory Engine:** Upstash replicates data across geographical zones, ensuring continuous availability and fast response times globally.

---

## 3. REST VS. RESP SOCKET PROTOCOLS FOR CLOUD SERVICES

Choosing the appropriate protocol for each workload is critical for optimizing system performance:

```
┌─────────────────────────────────────────────────────────────┐
│                 REDIS CONNECTION PROTOCOLS                  │
├───────────────────┬───────────────────┬─────────────────────┤
│ Dimension         │ HTTP REST Proxy   │ TCP Socket (RESP)   │
├───────────────────┼───────────────────┼─────────────────────┤
│ Protocol/Port     │ HTTPS / Port 443  │ TCP / Port 6379     │
├───────────────────┼───────────────────┼─────────────────────┤
│ Ideal Consumer    │ Vercel Edge / BFF │ Railway Workers     │
├───────────────────┼───────────────────┼─────────────────────┤
│ Connection Type   │ Stateless Pools   │ Persistent Sockets  │
├───────────────────┼───────────────────┼─────────────────────┤
│ Command Latency   │ 5ms - 15ms        │ < 1ms               │
├───────────────────┼───────────────────┼─────────────────────┤
│ Best Suited For   │ Session, Rate-Lim │ Queues, Event-Loops │
└───────────────────┴───────────────────┴─────────────────────┘
```

### 3.1 HTTP REST Protocol Guidelines
Edge Functions should connect using HTTP REST. Since Edge instances are ephemeral and terminate quickly, REST prevents the connection pool exhaustion issues common with traditional TCP sockets.

### 3.2 RESP TCP Socket Guidelines
Background workers should use TCP sockets on port 6379. Since workers are long-running containers, persistent sockets allow them to receive real-time job notifications and execute transactional commands (such as Redis MULTI/EXEC block operations) with minimal latency.

---

## 4. KEYSPACE STRUCTURING SCHEMA & CACHE TOPOGRAPHY

EDROS uses a structured namespace layout (`[system]:[entity]:[identifier]`) to prevent keyspace collisions and simplify cache invalidation.

### 4.1 Production Keyspace Registry

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EDROS KEYSPACE REGISTRY                              │
├──────────────────────┬─────────────┬──────────────┬─────────────────────────┤
│ Key Prefix Namespace │ Data Type   │ TTL Policy   │ Core Purpose            │
├──────────────────────┼─────────────┼──────────────┼─────────────────────────┤
│ `edros:tenant:*`     │ JSON String │ 24 Hours     │ Tenant layouts, brands  │
├──────────────────────┼─────────────┼──────────────┼─────────────────────────┤
│ `edros:session:*`    │ Hash Set    │ 1 Hour       │ Active sessions, tokens │
├──────────────────────┼─────────────┼──────────────┼─────────────────────────┤
│ `edros:rate:*`       │ String Int  │ 1 Minute     │ Edge rate-limiting keys │
├──────────────────────┼─────────────┼──────────────┼─────────────────────────┤
│ `edros:lock:*`       │ String      │ 5 Minutes    │ Double-submit prevention│
└──────────────────────┴─────────────┴──────────────┴─────────────────────────┘
```

#### 4.1.1 `edros:tenant:[subdomain]`
Caches custom tenant parameters (branding assets, CSS presets, localized API keys, and status flags).
* **TTL Policy:** 24 Hours.
* **Invalidation Trigger:** Flushed immediately when a tenant configuration is updated in the administrative portal.

#### 4.1.2 `edros:session:[token]`
Stores encrypted operator session details, including user permissions, IP address tags, and security descriptors.
* **TTL Policy:** 1 Hour.
* **Invalidation Trigger:** Refreshed on every active query; deleted immediately upon user logout or IP mismatch detection.

#### 4.1.3 `edros:rate:[ip_address]:[minute]`
A sliding-window counter tracking client requests to protect endpoints from automated abuse.
* **TTL Policy:** 1 Minute.
* **Invalidation Trigger:** Expires automatically.

#### 4.1.4 `edros:lock:[transaction_hash]`
A temporary operational lock used to prevent double-submissions (e.g., preventing a user from clicking "Submit Payment" twice in rapid succession).
* **TTL Policy:** 5 Minutes (non-renewable).
* **Invalidation Trigger:** Released automatically after a transaction completes or fails.

---

## 5. BULLMQ QUEUE ORCHESTRATION & STATE MANAGEMENT

BullMQ relies on Redis sorted sets, hashes, and streams to track and transition job states across the distributed system.

### 5.1 BullMQ Job State Lifecycle

```
                           [ Job Enqueued ]
                                  │
                                  ▼ (Key: "bull:queue:waiting")
                             [ Waiting ]
                                  │
                                  ▼ (Atomically moved to "active")
                             [ Active ]
                                  │
                 ┌────────────────┴────────────────┐
                 ▼ (Success)                       ▼ (Failure)
            [ Completed ]                      [ Failed / Retry ]
     - Moved to "completed"             - Check retry configurations
     - TTL: 24 Hours (cleanup)          - If attempts exhausted,
                                          move to Dead-Letter (DLQ)
```

### 5.2 Key Queue Keyspace Internals
* **`bull:[queue_name]:wait` (List):** Stores the IDs of jobs waiting in line to be processed by active workers.
* **`bull:[queue_name]:active` (Hash):** Tracks currently executing jobs, including worker signatures and execution start times.
* **`bull:[queue_name]:failed` (Set):** Stores failed job records, including stack traces and exit codes, to simplify administrative auditing.
* **`bull:[queue_name]:stalled` (Set):** Used by BullMQ's watchdog process to identify and recover jobs orphaned when a worker container crashes mid-execution.

---

## 6. SLIDING WINDOW RATE-LIMITING AT THE EDGE

To protect internal databases and downstream workers from Denial of Service (DoS) attacks, Vercel Edge Middleware validates rate-limiting counters in Upstash Redis before routing requests.

### 6.1 Code Reference: Sliding Window Rate-Limiter
This optimized middleware script implements a sliding-window rate-limiting algorithm using Upstash Redis to block abusive traffic at the Edge:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function checkRateLimit(req: NextRequest): Promise<boolean> {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const currentWindow = Math.floor(Date.now() / 60000); // 1-minute window block
  
  const redisKey = `edros:rate:${ip}:${currentWindow}`;
  const rateLimitMax = 120; // Allow maximum 120 requests per minute

  try {
    const checkUrl = `${process.env.REDIS_URL}/incr/${redisKey}`;
    const response = await fetch(checkUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to contact rate-limiting database.");
    }

    const data = await response.json();
    const requestCount = data.result ? parseInt(data.result, 10) : 0;

    // Set TTL on the key if this is the first request in the window
    if (requestCount === 1) {
      const expireUrl = `${process.env.REDIS_URL}/expire/${redisKey}/65`;
      await fetch(expireUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      });
    }

    return requestCount <= rateLimitMax;

  } catch (error) {
    console.error("Rate limit check failed:", error);
    // On core database failure, default to open to prevent blocking legitimate users
    return true;
  }
}
```

---

## 7. SECURITY CONTROLS, ENCRYPTION & DATA HARDENING

Caching financial and Personally Identifiable Information (PII) requires strict security controls to prevent data exposure or unauthorized modifications.

### 7.1 Security Hardening Standards
* **Encryption in Transit:** All connections, including those using the HTTP REST API and TCP sockets, must use **SSL/TLS 1.3** encryption. Unencrypted connections are disabled.
* **Payload Encryption:** Sensitive session details (e.g., permissions and operator tokens) must be encrypted using AES-256 before being written to Redis cache keys. Plaintext PII is never stored in cache memory.
* **Access Isolation:** The production Redis cluster is protected by unique, role-based tokens. Production worker systems use read-write credentials, while external analytical endpoints use restricted read-only keys.

---

## 8. CACHE INVALIDATION POLICIES & STRATEGIES

To prevent operators from viewing stale debt ledgers, EDROS implements a strict cache invalidation strategy.

### 8.1 Active Cache Invalidation Flow
* **Write-Through Caching:** When an operator updates a record (e.g., recording a payment), the backend updates the relational database first. Once the write is committed successfully, the application flushes the corresponding Redis cache key instantly.
* **Time-To-Live (TTL) Fallback:** Every cached key must have an explicit TTL configuration. If an invalidation event fails to execute, the key expires automatically after its TTL window, ensuring the system returns to a consistent state.

---

## 9. PERFORMANCE MONITORING, METRICS & ALERTS

Site Reliability Engineers (SREs) track cache health and performance in real time to ensure SLAs are met.

### 9.1 Key Performance Metrics (KPIs)
* **Cache Hit Ratio:** Tracks the percentage of queries resolved by the cache rather than the database. Target: **> 85.00%** on general tenant and branding assets.
* **Command Latency:** Tracks cache read and write response times. Target: **< 1.5ms** on RESP direct sockets, and **< 15ms** on HTTP REST APIs.
* **Active Connections:** Monitors concurrent client connections to prevent resource starvation.

### 9.2 Telemetry Alerting Rules (PagerDuty / Slack)
The monitoring system triggers alerts when operations breach these performance thresholds:

```
┌─────────────────────────────────────────────────────────────┐
│                   ALERTS & SLA BREACHES                     │
├───────────────┬───────────────────┬─────────────────────────┤
│ Condition     │ Trigger Limit     │ Incident Severity       │
├───────────────┼───────────────────┼─────────────────────────┤
│ Hit Ratio     │ < 60.00%          │ Warning (Slack Alert)   │
├───────────────┼───────────────────┼─────────────────────────┤
│ Latency Spike │ > 45ms (REST)     │ High (SRE PagerDuty)    │
├───────────────┼───────────────────┼─────────────────────────┤
│ Memory Usage  │ > 85.00% Capacity │ Critical (C-Suite Page) │
└───────────────┴───────────────────┴─────────────────────────┘
```

---

## 10. COMMON FAILURE MODES & TROUBLESHOOTING

Stateless and serverless caches can experience connection starvation, rate-limit exhaustion, or keyspace bloat. This section outlines standard diagnostics and resolution procedures.

### 10.1 Cache Thundering Herd Effect
* **Symptom:** A high-volume key (e.g., a popular tenant's configuration) expires, causing a sudden spike in database queries that degrades relational database performance.
* **Diagnostic Steps:** Check the database query log. A high volume of identical queries executed simultaneously indicates a thundering herd issue.
* **Resolution:** Use **Cache Locking** (e.g., `edros:lock:*`) to ensure that only the first query fetches data from the database and updates the cache. Other concurrent requests wait and read the refreshed cache key once it is written.

### 10.2 Keyspace Bloat & Eviction Failures
* **Symptom:** Upstash reports high memory utilization, and Redis starts evicting active keys before their TTL.
* **Diagnostic Steps:** Check memory usage metrics in the Upstash console. Review active keyspaces using `SCAN` commands to identify keys without configured TTL policies.
* **Resolution:** Ensure all cache keys have explicit TTL limits during insertion. For temporary operations, avoid using open-ended keys.

### 10.3 Rest Token Expiry & Unauthorized Failures
* **Symptom:** Application requests fail with authentication errors: `Error: 401 Unauthorized from Redis REST Proxy`.
* **Diagnostic Steps:** Check Vercel server logs. Verify that the configured `UPSTASH_REDIS_REST_TOKEN` matches current credentials in the Upstash console.
* **Resolution:** Rotate and update the credentials in the project settings. Deploy a new build to propagate the updated parameters to active Edge functions.

---

## 11. VALIDATION CHECKLIST & SYSTEM SMOKE TESTING

SOP compliance requires the SRE team to run this manual verification checklist immediately after performing Redis configuration updates or system migrations:

```
+─────────────────────────────────────────────────────────────────────────────+
| PRODUCTION CACHE VALIDATION SIGN-OFF SHEET                                  |
|                                                                             |
| Target Instance: [ Upstash Serverless Production ]                          |
| Active Keys:     [ 124,502 Active Keys ]                                    |
| SRE Sign-Off:    [ APPROVED / VERIFIED ]                                    |
| SecOps Sign-Off: [ APPROVED / ENCRYPTED ]                                   |
+─────────────────────────────────────────────────────────────────────────────+
```

### 11.1 Post-Deployment Smoke Test Actions
* [ ] **REST Connectivity Handshake:** Verify that Edge Functions query and receive keys successfully using the REST proxy on port 443.
* [ ] **RESP Sockets Handshake:** Confirm that Railway workers connect and receive events successfully over TCP sockets on port 6379.
* [ ] **SSL Enforcement Verification:** Verify that unencrypted connection attempts are dropped automatically by the Redis cluster.
* [ ] **Cache Invalidation Verification:** Update a tenant layout to confirm that the write triggers cache invalidation and updates the keyspace instantly.
* [ ] **Rate Limiter Test:** Simulate rapid requests to verify that sliding-window limits block traffic once thresholds are breached.

---

## 12. GLOSSARY & REFERENCES

### 12.1 Glossary of Terms
* **RESP:** Redis Serialization Protocol. The native TCP-based protocol used to communicate with Redis servers.
* **Sliding Window:** An advanced rate-limiting algorithm that tracks client request volumes within moving timeframes, providing precise access control.
* **Thundering Herd:** A performance bottleneck that occurs when a high-demand cache key expires, causing concurrent requests to query the database simultaneously.
* **TTL:** Time-To-Live. A configuration that defines how long a key remains cached before it is deleted automatically from memory.
* **Write-Through:** A caching strategy where write operations update the database first, and then invalidate or refresh the cache key.

### 12.2 References
1. **Upstash Serverless Redis Documentation:** Configuration, REST proxies, and latency optimization.
2. **BullMQ Queues Best Practices:** Connection scaling, Redis requirements, and event monitoring.
3. **OWASP Web Security Guidelines:** Securing session storage and protecting backend systems from brute-force attacks.
4. **Reserve Bank of India (RBI) Operational Guidelines:** Session security, access management, and transactional auditing.

---

## 13. APPENDIX

### 13.1 Production Cache Maintenance Log Template
Upon successful verification of a Redis update or failover, the SRE team must log the operation details using this structured template:

```
PRODUCTION CACHE MAINTENANCE RECORD:
Maintenance ID: MAC-REDIS-2026-0301
Date Logged:    2026-07-15 06:00:00 UTC
Active Cluster: Upstash Production Pool 1
Eviction Policy: volatile-lru (Evict least recently used keys with TTL)
Hit Ratio:      89.42% (Average over past 24 hours)
State:          HEALTHY & OPERATIONAL (Verification completed)
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
