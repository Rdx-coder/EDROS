# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-DEPLOY-001
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 1: ENTERPRISE INFRASTRUCTURE OVERVIEW

```
================================================================================
            E N T E R P R I S E   I N F R A S T R U C T U R E
                         O P E R A T I O N S   M A N U A L
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Chief Cloud Infrastructure Officer (CCIO)
Co-Authors:   Principal DevOps Architect, Principal Site Reliability Engineer
Reviewer:     Principal Platform Engineer, Lead Security Engineer
Approver:     Chief Technology Officer & Infrastructure Review Board
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline release of the Enterprise Infrastructure Overview manual. | Chief Cloud Infrastructure Officer | CTO & Infrastructure Review Board |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [EXECUTIVE SUMMARY](#2-executive-summary)
3. [INFRASTRUCTURE PHILOSOPHY](#3-infrastructure-philosophy)
4. [CLOUD ARCHITECTURE](#4-cloud-architecture)
5. [ASCII INFRASTRUCTURE DIAGRAM](#5-ascii-infrastructure-diagram)
6. [DEPLOYMENT OVERVIEW](#6-deployment-overview)
7. [PRODUCTION COMPONENTS SPECIFICATION](#7-production-components-specification)
8. [NETWORK OVERVIEW & TRAFFIC FLOW](#8-network-overview--traffic-flow)
9. [ENVIRONMENT OVERVIEW & SEGREGATION](#9-environment-overview--segregation)
10. [INFRASTRUCTURE DECISION MATRIX](#10-infrastructure-decision-matrix)
11. [INFRASTRUCTURE LIFECYCLE MANAGEMENT](#11-infrastructure-lifecycle-management)
12. [BEST PRACTICES & SECURITY RECOMMENDATIONS](#12-best-practices--security-recommendations)
13. [COMMON MISTAKES & INFRASTRUCTURE PITFALLS](#13-common-mistakes--infrastructure-pitfalls)
14. [VALIDATION CHECKLIST & SMOKE TESTING](#14-validation-checklist--smoke-testing)
15. [ROLLBACK PROCEDURES](#15-rollback-procedures)
16. [TROUBLESHOOTING PLAYBOOK](#16-troubleshooting-playbook)
17. [GLOSSARY & REFERENCES](#17-glossary--references)
18. [APPENDIX](#18-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
The purpose of this document is to establish the definitive architectural and operational standard for the Enterprise Debt Recovery Operating System (EDROS) physical and cloud infrastructure. This document provides a highly detailed, clear mapping of the multi-cloud topology, network interfaces, scaling models, security rules, and infrastructure lifecycle procedures that govern the EDROS ecosystem.

### 1.2 Scope
This document covers all production, staging, and development environments hosted across the EDROS multi-cloud network, which includes:
* **Edge Proxy & Security Gateways:** Cloudflare DNS, CDN, Web Application Firewall (WAF), and Rate Limiting.
* **Frontend and Serverless APIs Compute:** Vercel Compute Cloud.
* **Background Worker Pools:** Railway Container Platform.
* **Persistent Relational Database Services:** Neon Serverless PostgreSQL.
* **Asynchronous Queue & Distributed Cache Engines:** Upstash Redis.
* **Secure Storage Repositories:** Cloudflare R2 Object Storage buckets.
* **Continuous Integration & Delivery Pipelines:** GitHub Actions runners.
* **Observability & Alerting Engines:** Prometheus, Grafana, OpenTelemetry, Pino, and Sentry.

### 1.3 Target Audience
This manual is prepared for:
* **New DevOps and Site Reliability Engineers (SREs)** onboarding onto the EDROS operations team.
* **Lead System Architects** evaluating infrastructure capacity and failure domains.
* **Information Security (InfoSec) Auditors** verifying compliance with ISO 27001, SOC 2 Type II, DPDP, and Reserve Bank of India (RBI) guidelines.
* **Technical Managers** coordinating infrastructure upgrades, capacity planning, and regional expansions.

---

## 2. EXECUTIVE SUMMARY

The Enterprise Debt Recovery Operating System (EDROS) is an enterprise-grade platform designed by Sanjay Dangi Associates to automate the debt recovery lifecycle. Because debt recovery involves handling sensitive borrower records, financial transactions, and legal actions, the infrastructure must be resilient, secure, and compliant.

To meet these requirements, EDROS utilizes a decoupled, multi-cloud hosting model that distributes resources across specialized provider environments. Rather than hosting all services on a single cloud provider, the system places specific workloads on platforms optimized for their task:
* **Vercel** hosts the user interfaces and edge API routes, ensuring low-latency access for operators.
* **Railway** runs dedicated, isolated container instances to process asynchronous tasks (BullMQ workers).
* **Neon PostgreSQL** handles transactional relational data, supporting automated vertical scaling and branch-based development database environments.
* **Upstash Redis** manages distributed session caching and task coordination.
* **Cloudflare R2** stores secure generated PDFs and legal notices.
* **Cloudflare WAF & CDN** sits at the outer perimeter to protect the entire system from DDoS attacks and SQL injection attempts.

---

## 3. INFRASTRUCTURE PHILOSOPHY

EDROS’s platform engineering is driven by five core architectural guidelines:

```
┌─────────────────────────────────────────────────────────────┐
│                 CORE INFRASTRUCTURE PILLARS                 │
├───────────────┬─────────────────────────────────────────────┤
│ PILLAR 1      │ Serverless-First & Scale-to-Zero Compute     │
├───────────────┼─────────────────────────────────────────────┤
│ PILLAR 2      │ Decoupled Compute & Storage Boundaries      │
├───────────────┼─────────────────────────────────────────────┤
│ PILLAR 3      │ Immutable Infrastructure as Code (IaC)      │
├───────────────┼─────────────────────────────────────────────┤
│ PILLAR 4      │ Multi-Cloud Risk Diversification            │
├───────────────┼─────────────────────────────────────────────┤
│ PILLAR 5      │ Continuous Observability & Traceability     │
└───────────────┴─────────────────────────────────────────────┘
```

### 3.1 Serverless-First & Scale-to-Zero Compute
Compute and storage resources must scale dynamically based on active platform usage. During off-peak hours (e.g., between 21:00 and 07:00 when field collection is legally paused under RBI guidelines), relational databases and edge environments must scale down to minimum usage baselines. This optimization reduces operational overhead while preserving the performance needed during peak collection periods.

### 3.2 Decoupled Compute & Storage Boundaries
Compute environments must remain entirely stateless. Any persistent state—including user sessions, media uploads, and audit records—must be offloaded immediately to managed storage backends (PostgreSQL, Redis, R2). This decoupling allows operations teams to scale, patch, or restart compute containers without risking data corruption or service interruption.

### 3.3 Immutable Infrastructure as Code (IaC)
Manual infrastructure configurations via cloud provider dashboards are strictly prohibited in staging and production environments. All cloud resources must be managed, versioned, and applied using Infrastructure as Code configurations. This enforces environment consistency across development, staging, and production.

### 3.4 Multi-Cloud Risk Diversification
Hosting resources on a single cloud provider introduces risks from regional system outages and vendor lock-in. EDROS uses a multi-cloud architecture, running different parts of the system across Cloudflare, Vercel, Railway, Neon, and Upstash. This design isolates failure domains, ensuring a regional outage on one platform does not bring down the entire system.

### 3.5 Continuous Observability & Traceability
No infrastructure component may run in isolation without active logging and performance tracking. Compute containers and database nodes must export structured logs and metrics using OpenTelemetry standards. This data is collected in real-time to trigger alerts before system bottlenecks affect end-users.

---

## 4. CLOUD ARCHITECTURE

The EDROS system design decouples components by placing workloads on specialized cloud providers:

* **Vercel Edge & Compute Cloud:** Houses the main web application and serverless API route handlers. Vercel acts as the primary ingress point, serving static files and routing API requests to database or queue targets.
* **Railway Container Platform:** Runs the background worker processes. Because Vercel has a 30-second execution limit, long-running tasks—such as PDF compilation, RC4 encryption, and batch messaging—are delegated to Docker containers running on Railway.
* **Neon PostgreSQL Database:** A serverless relational database engine. Neon separates database storage from compute, allowing the storage nodes to remain active while the compute engines scale up or down automatically based on query demand.
* **Upstash Redis Caching Engine:** A serverless, low-latency Redis database. It coordinates task queue assignments for BullMQ, tracks API rate limits, and caches user sessions.
* **Cloudflare Secure Object Store (R2):** An S3-compatible object storage repository that charges zero egress fees. It acts as the system's document vault, storing legal notice PDFs, operator photos, and case documents.
* **Cloudflare Edge Protection Network:** Sits at the perimeter of the infrastructure, managing SSL certificates, DNS routing, and DDoS mitigation.

---

## 5. ASCII INFRASTRUCTURE DIAGRAM

The following diagram maps the structural flow of data and network connections across the EDROS multi-cloud infrastructure:

```
                                  [ INTERNET ROUTE ]
                                          │
                                          ▼ (TLS 1.3 / Port 443)
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CLOUDFLARE EDGE PROTECTION WORK                       │
│                                                                             │
│   - Global DNS Resolution             - DDoS & Bot Mitigation               │
│   - SSL/TLS Termination               - Edge Web Application Firewall (WAF) │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼ (Secure HTTPS Route)                        ▼ (Secure API Proxy)
┌────────────────────────────────────────┐   ┌────────────────────────────────┐
│         VERCEL COMPUTE CLOUD           │   │      CLOUDFLARE R2 VAULT       │
│                                        │   │                                │
│   - Next.js Web Console (SPA)          │   │   - Secure PDF Archives        │
│   - Serverless API Gateways            │   │   - Watermarked legal Documents│
│   - Local Route Caching                │   │   - Zero Egress Fees Storage   │
└────────┬──────────────────────┬────────┘   └────────────────▲───────────────┘
         │                      │                             │ (S3 Secure SDK)
         │ (Prisma Connections) │                             │
         │                      └──────────────┐              │
         ▼                                     ▼              │
┌────────────────────────┐           ┌────────────────────────┴───────┐
│     NEON POSTGRES      │           │     RAILWAY WORKERS POOL       │
│                        │           │                                │
│ - Master Database      │           │   - BullMQ Async Background   │
│ - Soft-Delete Engine   │           │     Processing Workers         │
│ - pgBouncer Pool       │           │   - PDF Generation Engine      │
│ - Auto-Branching Node  │           │   - Dockerized Node Worker Runs    │
└────────────────────────┘           └──────────────▲─────────────────┘
                                                    │
                                                    │ (BullMQ Task Event)
                                                    ▼
                                     ┌────────────────────────────────┐
                                     │     UPSTASH REDIS CLUSTER      │
                                     │                                │
                                     │   - Queue Coordination Engine  │
                                     │   - API Rate Limit Counter     │
                                     │   - Operator Session Cache     │
                                     └────────────────────────────────┘
```

---

## 6. DEPLOYMENT OVERVIEW

The EDROS system uses a GitOps-driven deployment model. This ensures code changes are automatically tested and validated before moving to production.

```
 [ Developer Commit ] ────► [ GitHub Repository ] ────► [ GitHub Actions Runner ]
                                                               │
                                         ┌─────────────────────┴─────────────────────┐
                                         ▼                                           ▼
                                 [ Deploy Frontend ]                         [ Deploy Worker ]
                                 (Trigger Vercel Build)                      (Railway Container)
                                         │                                           │
                                         ▼                                           ▼
                                 [ Production Assets ]                       [ Running Worker ]
```

1. **Commit Trigger:** Developers push code modifications to specific environment branches (`main`, `staging`, `development`).
2. **Pipeline Execution:** GitHub Actions runners trigger automated linting, security scans, unit tests, and database schema validation scripts.
3. **Frontend Compilation:** On approval, Vercel compiles the Next.js assets, deploys serverless route functions, and updates edge caches.
4. **Worker Container Build:** Railway rebuilds the backend Docker containers, runs automated health checks, and performs a rolling release to update active workers without downtime.

---

## 7. PRODUCTION COMPONENTS SPECIFICATION

The following matrix defines the hardware profiles, performance configurations, and hosting details for each component in the production environment:

| Provider | Service Role | Deployment Profile | Scaling Model | Targeted SLA |
| :--- | :--- | :--- | :--- | :---: |
| **Cloudflare** | Edge WAF / CDN | Global Edge Network | Dynamic CDN scaling | 99.999% |
| **Vercel** | Next.js API / UI | Standard Serverless | Automated horizontal scaling based on request volume | 99.99% |
| **Railway** | BullMQ Workers | Docker on Linux (vCPU: 2.0, RAM: 4.0 GB) | Horizontally scales between 1 and 8 container instances | 99.95% |
| **Neon** | Primary PostgreSQL | Autoscaling Compute (vCPU: 1.0 to 4.0, RAM: 3.0 to 12.0 GB) | Dynamic vertical scaling based on memory load | 99.95% |
| **Upstash** | Session / Queue Redis | Serverless Redis Cluster | Automatic scaling up to 50,000 requests/sec | 99.99% |
| **Cloudflare** | R2 Object Storage | S3-Compatible Storage | Automated volume scaling | 99.999% |

---

## 8. NETWORK OVERVIEW & TRAFFIC FLOW

Traffic flowing through the EDROS network must follow strict security routes. Directly exposing database ports, Redis caches, or worker environments to the public internet is prohibited.

```
+─────────────────────────────────────────────────────────────────────────────+
|                          SECURE NETWORK TRAFFIC FLOW                        |
|                                                                             │
|   [ Public Request ] ──────────────────────────────────────────┐            │
|                                                                ▼            │
|   +──────────────────────────────────────────────────────────+ │            │
|   | CLOUDFLARE SECURITIES RING                               | │            │
|   |  - Blocks SQL injections, cross-site scripting, & DDoS   |◄┘            │
|   +──────────────────────────┬───────────────────────────────+              │
|                              │ (HTTPS / TLS 1.3 only)                       │
|                              ▼                                              │
|   +──────────────────────────────────────────────────────────+              │
|   | VERCEL EDGE PLATFORM                                     |              │
|   |  - Authenticates users with JWT tokens                   |              │
|   +──────────────────────────┬───────────────────────────────+              │
|                              │                                              │
|               ┌──────────────┴──────────────┐                               │
|               ▼ (Secure pgBouncer Connection)▼ (VPC / Encrypted SSL Route)   │
|   +──────────────────────────+  +────────────────────────────+              │
|   | NEON DATABASE CLUSTER    |  | RAILWAY WORKER CONTAINER    |              │
|   |  - Runs database queries |  |  - Pulls background tasks  |              │
|   +──────────────────────────+  +────────────────────────────+              │
+─────────────────────────────────────────────────────────────────────────────+
```

### 8.1 Ingress Path & Perimeter Security
* **DNS Routing:** Public DNS queries point exclusively to Cloudflare name servers.
* **SSL Termination:** Cloudflare manages TLS handshakes, enforcing TLS 1.3 encryption.
* **Firewall Rules:** The Web Application Firewall (WAF) blocks SQL injections, cross-site scripting (XSS), and automated bot scans before traffic reaches downstream compute nodes.

### 8.2 Internal Compute to Storage Security
* **PostgreSQL Connections:** Next.js APIs connect to Neon PostgreSQL using pgBouncer connection strings. These connections require SSL mode (`sslmode=require`) to protect data in transit.
* **Redis Connections:** Workers connect to Upstash Redis using TLS-encrypted endpoints, using password authentication on every connection.
* **Object Storage Access:** Applications access Cloudflare R2 using AWS Signature Version 4. This ensures all read and write requests are cryptographically signed and authenticated.

---

## 9. ENVIRONMENT OVERVIEW & SEGREGATION

To isolate development, testing, and live environments, EDROS maintains three distinct deployment rings.

```
 ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
 │                      │      │                      │      │                      │
 │     DEVELOPMENT      │─────►│       STAGING        │─────►│      PRODUCTION      │
 │     (Sandbox / Dev)  │      │     (QA / Testing)   │      │     (Active Live)    │
 │                      │      │                      │      │                      │
 └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

### 9.1 Development Environment (DEV)
* **Purpose:** Sandbox for developers to write and test new features.
* **Config:** Compute resources are configured to scale-to-zero when idle, and database nodes use Neon's branching engine to allow fast, isolated schema testing.

### 9.2 Staging Environment (STG)
* **Purpose:** A replica of the production environment used for integration testing and QA validation.
* **Config:** Automatically updated on merges to the `staging` branch. Runs automated Playwright E2E test suites to verify system stability before deployment.

### 9.3 Production Environment (PROD)
* **Purpose:** The active live environment serving banks, managers, and field executives.
* **Config:** Restricts database access, enforces strict security policies, and has maximum scaling limits configured to handle high-volume recovery campaigns.

---

## 10. INFRASTRUCTURE DECISION MATRIX

To ensure performance, availability, and cost-efficiency, infrastructure choices are evaluated against specific operational criteria:

```
+───────────────────────────────────────────────────────────────────────────────+
|                          PROVIDER DECISION COMPASS                            |
+──────────────────────────┬────────────────────────────────────────────────────+
| PERFORMANCE & LATENCY    | Route API requests to Vercel Edge compute.         |
| RELIABILITY & UPTIME     | Run persistent, high-throughput workers on Railway.|
| COST OPTIMIZATION        | Store large document archives in Cloudflare R2.    |
+──────────────────────────┴────────────────────────────────────────────────────+
```

### 10.1 Technical Criteria Mappings

* **Performance & Latency:** API requests must execute in `< 150ms`. High-frequency updates are cached in Upstash Redis to reduce database read overhead.
* **Reliability & Uptime:** Persistent worker processes run on Railway containers, using active-passive failover and automated health checks to prevent queue processing interruptions.
* **Cost Optimization:** Large PDF notice archives are stored in Cloudflare R2, using zero egress fees to significantly reduce bandwidth costs.

---

## 11. INFRASTRUCTURE LIFECYCLE MANAGEMENT

EDROS manages infrastructure resources through a standardized lifecycle to ensure consistency, security, and traceability:

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ 1. Plan &     │─────►│ 2. Test &     │─────►│ 3. Monitor &  │─────►│ 4. Retire &   │
│    Provision  │      │    Deploy     │      │    Optimize   │      │    Archive    │
└───────────────┘      └───────────────┘      └───────────────┘      └───────────────┘
```

1. **Plan & Provision:** Define new infrastructure resources using Infrastructure as Code (IaC). Changes are reviewed by DevOps and Security leads before approval.
2. **Test & Deploy:** Deploy configuration changes to Staging first, running automated performance and security scans to verify system stability.
3. **Monitor & Optimize:** Track system health and resource usage in Production using OpenTelemetry, Prometheus, and Grafana.
4. **Retire & Archive:** Safely decommission outdated services. Data must be purged in compliance with DPDP data retention policies before shutting down associated storage resources.

---

## 12. BEST PRACTICES & SECURITY RECOMMENDATIONS

To maintain a secure, high-performing, and compliant platform, operations teams must follow these infrastructure guidelines:

### 12.1 Security Controls & Compliance
* **Secret Hygiene:** Never commit credentials, API keys, or database connection strings to the Git repository. Store all secrets securely in Cloudflare WAF, Vercel, and Railway environment configurations, and rotate keys every 90 days.
* **Least Privilege Access:** Restrict database write permissions, storage bucket access, and serverless administration to authorized infrastructure engineers.
* **Database Branching Security:** When using Neon's branching engine to test schemas, ensure PII (such as debtor phone numbers and bank account numbers) is masked or anonymized in dev environments.

### 12.2 Performance Optimizations
* **Connection Reuse:** Ensure serverless Next.js functions reuse open database connections by instantiating the Prisma client outside the primary function scope.
* **Edge Caching:** Cache static assets, UI components, and non-sensitive API responses at Cloudflare’s edge nodes to reduce load on origin compute servers.

---

## 13. COMMON MISTAKES & INFRASTRUCTURE PITFALLS

Avoid these common configuration errors that can lead to performance issues or system instability:

* **Overrunning Serverless Timeout Limits:** Attempting to process complex, high-latency tasks—such as compiling bulk legal notice PDFs—within serverless Next.js functions. These operations exceed Vercel's 30-second timeout limit and crash.
  * *Correction:* Delegate long-running tasks to background BullMQ workers running on Railway containers.
* **Improper Connection Pool Sizing:** Exceeding PostgreSQL connection limits by failing to configure pgBouncer.
  * *Correction:* Use pgBouncer endpoints for serverless API connections, and set appropriate query timeout limits to protect database pools.
* **Unrestricted Storage Buckets:** Configuring Cloudflare R2 storage buckets to allow public, unauthenticated read access to generated PDFs and debtor documents.
  * *Correction:* Set R2 buckets to private, and serve sensitive documents exclusively using signed, short-lived URLs.

---

## 14. VALIDATION CHECKLIST & SMOKE TESTING

Before deploying infrastructure or database schema changes to production, verify system health against this checklist:

* [ ] **Compute Verification:** Confirm that all serverless API routes return successful responses (`200 OK`) and that Railway workers are online and processing queues.
* [ ] **Database Connection Check:** Verify that Prisma clients can successfully connect to production Neon database pools using pgBouncer.
* [ ] **Cache Latency Validation:** Confirm that connection latency to Upstash Redis is `< 5ms`.
* [ ] **Storage Integrity Check:** Generate a test legal notice PDF, save it to Cloudflare R2, and confirm that it can only be accessed using a signed, authenticated URL.
* [ ] **Security Perimeter Audit:** Verify that Cloudflare Edge WAF rules are active and blocking unauthorized requests.

---

## 15. ROLLBACK PROCEDURES

If an infrastructure deployment introduces instability, follow these steps to restore the last known healthy state:

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                           ROLLBACK TIMELINE                             │
  ├────────────────────────────────────┬────────────────────────────────────┤
  │ 0 - 5 Minutes: Revert Code         │ 5 - 15 Minutes: Database Restore   │
  │ Use Vercel & Railway dashboards    │ Run point-in-time recovery (PITR)  │
  │ to revert compute to last build.   │ if schemas corrupted data.         │
  ├────────────────────────────────────┼────────────────────────────────────┤
  │ 15 - 20 Minutes: Validate          │ 20 - 30 Minutes: Complete          │
  │ Run automated smoke tests to       │ Confirm all services are healthy   │
  │ verify connection health.          │ and close the incident ticket.     │
  └────────────────────────────────────┴────────────────────────────────────┘
```

1. **Revert Frontend Compute:** Log in to Vercel, navigate to the project deployment history, and promote the last known stable deployment to active production. This updates routing at the edge in `< 10 seconds`.
2. **Revert Background Workers:** Revert the Railway container to its previous stable Docker image tag, and verify that the worker containers start successfully.
3. **Database Restore:** If a schema migration caused data corruption, use Neon's Point-in-Time Recovery (PITR) to restore the database to its state prior to the migration.
4. **Smoke Testing:** Run automated validation tests to confirm database connections, background queues, and edge endpoints are healthy.

---

## 16. TROUBLESHOOTING PLAYBOOK

Use these diagnostics and commands to resolve common infrastructure issues:

### 16.1 Database Connection Pool Exhaustion
* **Symptom:** Next.js APIs return `504 Gateway Timeout` or Prisma throws connection limit errors.
* **Diagnostic Steps:** Check active connections in the Neon console.
* **Resolution:** Ensure the connection string points to the `pgBouncer` endpoint (port 5432 or with pooling parameters configured). If necessary, restart worker containers on Railway to close leaked, hanging database connections.

### 16.2 BullMQ Queue Processing Delays
* **Symptom:** Background tasks (such as notice generation or SMS campaigns) are delayed.
* **Diagnostic Steps:** Query the Upstash Redis queue size using command-line tools:
  ```bash
  redis-cli -u redis://:password@endpoint.upstash.io:port LLEN bull:recovery-tasks:wait
  ```
* **Resolution:** If the queue is growing, scale Railway worker containers horizontally to increase processing capacity.

### 16.3 Storage Upload Failures
* **Symptom:** Operations staff receive upload errors when saving documents.
* **Diagnostic Steps:** Verify R2 credentials and bucket permissions.
* **Resolution:** Confirm that Cloudflare R2 access keys are valid and have active read and write permissions configured.

---

## 17. GLOSSARY & REFERENCES

### 17.1 Glossary of Terms
* **pgBouncer:** A lightweight connection pooler for PostgreSQL that helps manage large volumes of serverless connections efficiently.
* **BullMQ:** A high-performance, Redis-backed message queue library for Node.js used to handle complex background tasks.
* **Egress Fees:** Data transfer charges associated with retrieving files from cloud storage. Cloudflare R2 has zero egress fees.
* **WAF:** Web Application Firewall. Monitors, filters, and blocks malicious HTTP traffic to protect web applications.
* **IaC:** Infrastructure as Code. A method of managing and provisioning cloud resources using machine-readable configuration files.

### 17.2 Cloud & Security References
1. **AWS Well-Architected Framework:** Design guidelines for building secure, high-performing, resilient, and efficient cloud infrastructures.
2. **NIST Cybersecurity Framework:** Cybersecurity standards and guidelines used to protect critical enterprise infrastructure.
3. **Cloudflare WAF Documentation:** Official guide for configuring edge web application firewalls and DDoS protection rules.
4. **Prisma & Serverless PostgreSQL Connection Management:** Best practices for configuring database connections in serverless environments.

---

## 18. APPENDIX

### 18.1 Network Port Registry
The following table registry defines the strict inbound and outbound ports allowed across the EDROS infrastructure:

| Direction | Source | Target | Protocol | Port | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Inbound | Internet | Cloudflare Edge | TCP | 443 | Public HTTPS Traffic |
| Outbound | Cloudflare Edge | Vercel Gateway | TCP | 443 | Routed API / Frontend Requests |
| Outbound | Vercel / Railway | Neon Postgres | TCP | 5432 / 6543 | Secure Database Connections (pgBouncer) |
| Outbound | Vercel / Railway | Upstash Redis | TCP | 6379 / 36379| Encrypted Cache & Queue Streams |
| Outbound | Vercel / Railway | Cloudflare R2 | TCP | 443 | Secure Object Storage Uploads |

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
