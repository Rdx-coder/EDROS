# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-GOV-RSK-003
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 3: RISK MANAGEMENT FRAMEWORK

```
================================================================================
                    R I S K   M A N A G E M E N T
                             F R A M E W O R K
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Chief Risk Officer (CRO)
Co-Authors:   Chief Information Security Officer (CISO), Chief Compliance Officer (CCO)
Reviewer:     Lead SRE, Head of Banking Audits
Approver:     Chief Technology Officer & Risk Committee
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline release of the Risk Management Framework. | Chief Risk Officer | CTO & Risk Committee |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [APPLICABLE STANDARDS & REGULATORY MANDATES](#2-applicable-standards--regulatory-mandates)
3. [DEFINITIONS](#3-definitions)
4. [RISK MANAGEMENT PHILOSOPHY & OBJECTIVES](#4-risk-management-philosophy--objectives)
5. [ROLES & RISK MANAGEMENT RESPONSIBILITIES](#5-roles--risk-management-responsibilities)
6. [RISK IDENTIFICATION METHODOLOGY](#6-risk-identification-methodology)
7. [RISK ASSESSMENT & RISK MATRIX SCORING](#7-risk-assessment--risk-matrix-scoring)
8. [ENTERPRISE RISK REGISTER](#8-enterprise-risk-register)
9. [BUSINESS RISKS & MITIGATION PLANS](#9-business-risks--mitigation-plans)
10. [TECHNICAL RISKS & SYSTEM ARCHITECTURE MITIGATION](#10-technical-risks--system-architecture-mitigation)
11. [LEGAL & COMPLIANCE RISKS (DPDP & RBI)](#11-legal--compliance-risks-dpdp--rbi)
12. [OPERATIONAL & FIELD COLLECTION RISKS](#12-operational--field-collection-risks)
13. [VENDOR & THIRD-PARTY INTEGRATION RISKS](#13-vendor--third-party-integration-risks)
14. [DECISION MATRIX & EMERGENCY RISK RESPONSE](#14-decision-matrix--emergency-risk-response)
15. [REGULATORY COMPLIANCE MATRIX](#15-regulatory-compliance-matrix)
16. [GOVERNANCE CONTROLS & SECURITY SEALS](#16-governance-controls--security-seals)
17. [RISK MANAGEMENT KEY PERFORMANCE INDICATORS (KPIS)](#17-risk-management-key-performance-indicators-kpis)
18. [BEST PRACTICES & EXCELLENCE STRATEGIES](#18-best-practices--excellence-strategies)
19. [COMMON MISTAKES & RISK MITIGATION PITFALLS](#19-common-mistakes--risk-mitigation-pitfalls)
20. [AUDIT & VALIDATION CHECKLISTS](#20-audit--validation-checklists)
21. [REFERENCES & GLOSSARY](#21-references--glossary)
22. [APPENDIX](#22-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
The purpose of this document is to establish the definitive Risk Management Framework (RMF) for the Enterprise Debt Recovery Operating System (EDROS) at Sanjay Dangi Associates. This framework provides the structured processes, risk evaluation metrics, operational registries, and technical mitigation paths required to identify, analyze, monitor, and treat risks across the business, technical, legal, and operational domains of the platform.

### 1.2 Scope
This framework governs the risk lifecycle across all environments, partners, and user interfaces within the EDROS ecosystem, including:
* **Business Risks:** Revenue models, partner bank confidence, reputational standing, and collection efficiency.
* **Technical Risks:** System downtime, compute performance, multi-cloud failure domains, and code security.
* **Legal Risks:** Regulatory violations (RBI, DPDP), borrower litigation, and data protection vulnerabilities.
* **Operational Risks:** Field executive safety, coordinates bypass, geofence mismatch, and branch management overhead.
* **Vendor Risks:** Performance degradation of third-party SMS, payment, and maps APIs.

### 1.3 Target Audience
This risk framework is prepared for:
* **The Chief Risk Officer (CRO) and Risk Management Committee** to assess portfolio hazards and coordinate mitigation campaigns.
* **Super Administrators and Compliance Officers** to run regular compliance checklists and policy audits.
* **Systems Architects, SREs, and Security Engineers** to verify that infrastructure components match technical resilience policies.
* **Partner Banks, Enterprise Clients, and External Auditors** looking to verify system hazard identification, recovery time objectives, and data protection controls.

---

## 2. APPLICABLE STANDARDS & REGULATORY MANDATES

The Risk Management Framework of EDROS is built in compliance with international standards and regional banking requirements:

* **ISO 31000:2018:** Risk Management Guidelines.
* **ISO/IEC 27005:2022:** Information Security Risk Management.
* **COSO Enterprise Risk Management (ERM) Framework:** Aligning risk management with enterprise strategy.
* **Reserve Bank of India (RBI) Directions:** IT Framework and Fair Practices Code (FPC) for Asset Reconstruction and Collection Agencies.
* **Digital Personal Data Protection (DPDP) Act, 2023:** Protecting personal borrower identifiers and managing risk vectors.

> **CRITICAL LEGAL NOTICE:** Any legislative and regulatory compliance mandates referenced in this document (such as India's DPDP Act 2023 or the Reserve Bank of India’s operational collections directions) must be reviewed against the latest applicable legal and regulatory requirements prior to actual production implementation.

---

## 3. DEFINITIONS

* **Risk Appetite:** The maximum level of risk that Sanjay Dangi Associates is willing to accept while pursuing its business objectives.
* **Residual Risk:** The remaining level of risk that exists after planned security controls and mitigation activities have been implemented.
* **Single Point of Failure (SPOF):** Any system component or third-party service that, if disabled, causes an immediate interruption of primary business operations.
* **Point-in-Time Recovery (PITR):** The capability to restore a database to its exact state at a specific millisecond in the past, minimizing data loss after corruption events.
* **Haircut Margin Risk:** The risk of financial loss resulting from supervisors approving debt settlements that write off excess portions of outstanding balances.

---

## 4. RISK MANAGEMENT PHILOSOPHY & OBJECTIVES

### 4.1 Risk Management Philosophy
EDROS approaches risk management with a "Prevention First, Recovery Second" philosophy. The platform is designed to automate risk prevention by integrating compliance boundaries and security controls directly into the system architecture. By proactively identifying and mitigating potential hazards, EDROS aims to prevent financial and regulatory exposure before it can occur.

```
┌─────────────────────────────────────────────────────────────┐
│                   RISK CONTROL HIERARCHY                    │
├───────────────┬─────────────────────────────────────────────┤
│ LEVEL 1       │ Systematic Prevention (Automated Lockouts)  │
├───────────────┼─────────────────────────────────────────────┤
│ LEVEL 2       │ Structural Isolation (Multi-Cloud Borders)  │
├───────────────┼─────────────────────────────────────────────┤
│ LEVEL 3       │ Active Monitoring (Real-time Sentry Alerts) │
├───────────────┼─────────────────────────────────────────────┤
│ LEVEL 4       │ Graceful Failover (PITR Database Backups)   │
└───────────────┴─────────────────────────────────────────────┘
```

### 4.2 Key Objectives
* **Maintain Compliance:** Ensure 100% compliance with DPDP, RBI, and ISO 27001 standards.
* **Isolate Failure Domains:** Protect critical systems by decoupling compute (Vercel, Railway) from storage (Neon, Cloudflare R2).
* **Verify System Operations:** Enforce strict verification rules, such as GPS-geofenced field visits and multi-level settlement approvals.
* **Provide Continuous Visibility:** Track system and operational health using real-time telemetry, logs, and audit ledgers.

---

## 5. ROLES & RISK MANAGEMENT RESPONSIBILITIES

Managing risk across EDROS is a coordinated effort led by the Risk Committee and executed across distinct corporate roles:

```
[ Risk Management Organization ]
                │
                ├──► Risk Committee - Policy Approval & Strategy
                │
                ├──► Chief Risk Officer (CRO) - Framework Coordination
                │
                ├──► Chief Compliance Officer (CCO) - Regulatory Audits
                │
                └──► SREs & DevOps Engineers - System Failovers & Backups
```

* **Risk Committee:** Reviews monthly risk assessments, approves mitigation strategies, and defines corporate risk tolerance limits.
* **Chief Risk Officer (CRO):** Oversees the implementation of the Risk Management Framework, tracks risk registers, and coordinates response plans during high-severity incidents.
* **Chief Compliance Officer (CCO):** Verifies that platform policies, data handling procedures, and contact rules align with regional banking laws and privacy standards.
* **SRE & DevOps Engineers:** Implements technical mitigation controls, manages automated backup routines, monitors system health, and handles infrastructure failovers.

---

## 6. RISK IDENTIFICATION METHODOLOGY

To ensure comprehensive coverage, potential risks are identified through three structured channels:

1. **Failure Mode and Effects Analysis (FMEA):** Conducting detailed technical reviews of application components, third-party integrations, and infrastructure links to identify potential points of failure.
2. **Operational Process Audits:** Reviewing field collection workflows, branch management procedures, and case assignment routines to identify operational bottlenecks and human error risks.
3. **Regulatory Change Tracking:** Monitoring updates to data privacy laws, financial regulations, and debt recovery guidelines to prevent compliance exposure.

---

## 7. RISK ASSESSMENT & RISK MATRIX SCORING

Identified risks are scored and prioritized based on their Likelihood and Impact Severity, using a standard 5x5 scoring grid:

### 7.1 The 5x5 Risk Evaluation Matrix

```
       [ LIKELIHOOD SCORE ]
       5 [ Almost Certain ]  │  M  │  H  │  C  │  C  │  C  │
       4 [ Likely ]          │  M  │  H  │  H  │  C  │  C  │
       3 [ Moderate ]        │  L  │  M  │  H  │  H  │  C  │
       2 [ Unlikely ]        │  L  │  L  │  M  │  H  │  H  │
       1 [ Rare ]            │  L  │  L  │  M  │  M  │  H  │
                             └───────────────────────────
                                1     2     3     4     5
                             [ IMPACT SEVERITY SCORE ]

Legend:  L = Low Risk (1-3) | M = Medium Risk (4-8) | H = High Risk (9-14) | C = Critical Risk (15-25)
```

### 7.2 Impact Severity Classifications
* **1 (Negligible):** Little to no operational or financial impact. Quickly resolved.
* **2 (Minor):** Minor delays in auxiliary workflows, or negligible financial losses.
* **3 (Moderate):** Localized service interruptions, minor regulatory warnings, or manageable financial impacts.
* **4 (Major):** Broad service downtime affecting core portals, potential regulatory audits, or major financial write-offs.
* **5 (Critical):** Prolonged platform outage, data privacy leaks exposing PII, severe regulatory penalties, or significant financial losses.

---

## 8. ENTERPRISE RISK REGISTER

The active risks associated with the EDROS platform are tracked and managed within the Enterprise Risk Register:

| Risk ID | Domain | Description of Risk | Likelihood | Impact | Score | Mitigation Strategy | Residual Score |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| **R-TECH-01**| Tech | Database connection pool exhaustion under peak loads. | 4 | 4 | **16 (C)** | Route connections through pgBouncer pools, optimize queries, and configure scaling limits. | **4 (M)** |
| **R-LEGL-02**| Legal | Exposure of borrower PII during file transfers or dashboard use. | 2 | 5 | **10 (H)** | Encrypt databases at rest, use secure HTTPS tunnels, and mask sensitive PII in dashboards. | **2 (L)** |
| **R-OPER-03**| Oper | Geofence bypass attempts using modified client devices. | 3 | 3 | **9 (H)** | Enforce browser-level coordinate checks and cross-reference locations against branch boundaries. | **3 (M)** |
| **R-VEND-04**| Vendor| Outage or degraded performance of critical third-party SMS gateways. | 4 | 3 | **12 (H)** | Set up secondary backup gateways and route traffic dynamically based on latency metrics. | **4 (M)** |

---

## 9. BUSINESS RISKS & MITIGATION PLANS

Sanjay Dangi Associates identifies and manages key business risks to protect corporate revenue and client partnerships:

### 9.1 Loss of Partner Bank Confidence
* **Risk Description:** Operational errors or compliance failures (such as out-of-bounds agent calls) degrade trust with client banks, risking contract terminations.
* **Business Impact:** High. Potential loss of core business contracts and negative brand reputation.
* **Mitigation Plan:**
  - Standardize all outreach campaigns through the EDROS operational time gate, enforcing hard lockouts outside of RBI hours.
  - Provide client banks with real-time tracking portals showing case activity, visit histories, and compliance logs.
  - Implement granular Role-Based Access Control (RBAC) to ensure borrower portfolios are accessed only by authorized staff.

---

## 10. TECHNICAL RISKS & SYSTEM ARCHITECTURE MITIGATION

Technical risks are handled through redundant configurations and decoupled architectures to ensure system stability and high availability:

```
+─────────────────────────────────────────────────────────────────────────────+
|                          TECHNICAL RESILIENCE ROUTE                         |
|                                                                             │
|   [ Database Failure ] ────────────────────────────────────────┐            │
|                                                                ▼            │
|   +──────────────────────────────────────────────────────────+ │            │
|   | NEON MULTI-NODE REDUNDANCY                               | │            │
|   |  - Active-passive replica pools handle failover          |◄┘            │
|   +──────────────────────────┬───────────────────────────────+              │
|                              │                                              │
|                              ▼                                              │
|   +──────────────────────────────────────────────────────────+              │
|   | POINT-IN-TIME RECOVERY (PITR)                            |              │
|   |  - Restore databases to the exact second before loss     |              │
|   +──────────────────────────────────────────────────────────+              │
+─────────────────────────────────────────────────────────────────────────────+
```

### 10.1 Database Failure & Data Corruption
* **Risk Description:** Relational database outages or schema corruption during migrations can cause data loss and halt platform operations.
* **Mitigation Plan:**
  - Use Neon’s multi-node database clustering with automated active-passive replica failover.
  - Run hourly point-in-time recovery (PITR) snapshots, and archive database backups in secure Cloudflare R2 buckets.
  - Validate all schema updates on isolated Neon database branches before applying changes to the production environment.

### 10.2 API & Serverless Timeout Limits
* **Risk Description:** Running high-latency tasks—such as batch legal PDF compilation—inside Next.js API routes can exceed serverless limits and crash.
* **Mitigation Plan:**
  - Route long-running tasks to background BullMQ workers running on Railway containers.
  - Use Upstash Redis to manage and track active tasks, decoupling user requests from background processing.

---

## 11. LEGAL & COMPLIANCE RISKS (DPDP & RBI)

Non-compliance with financial and privacy regulations carries major reputational and legal risks.

### 11.1 Unauthorized Contact & Out-of-Bounds Outreach
* **Risk Description:** Staff contacting debtors outside of permitted contact hours or at unapproved coordinates can violate RBI guidelines and lead to penalties.
* **Mitigation Plan:**
  - Enforce a system-wide operational time gate that disables outreach tools and locks mobile apps outside of allowed hours (08:00 to 19:00).
  - Cross-reference GPS coordinates during mobile check-ins, blocking visits outside of branch boundaries.

### 11.2 Borrower Personal Data Leakage (DPDP)
* **Risk Description:** Exposing borrower PII to unauthorized developers or general field executives can violate DPDP Act regulations.
* **Mitigation Plan:**
  - Encrypt database tables and object storage at rest using AES-256 keys.
  - Implement active data masking on user dashboards, showing only the minimum personal data required to complete a collection action.
  - Maintain cryptographically sealed system audit ledgers tracking all user access and database modifications.

---

## 12. OPERATIONAL & FIELD COLLECTION RISKS

SOPs require strict physical and geographical tracking to manage operational risks associated with field collections.

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                           FIELD COMPLIANCE CHECK                        │
  ├────────────────────────────────────┬────────────────────────────────────┤
  │ GPS GEOFENCE VERIFICATION          │ PHOTO VALIDATION                   │
  │ - Validate coordinates against the │ - Require agents to capture site   │
  │   branch's assigned geofence.      │   photos before check-in.          │
  ├────────────────────────────────────┼────────────────────────────────────┤
  │ OFFLINE QUEUE ENCRYPTION           │ MULTI-LEVEL SETTLEMENTS            │
  │ - Store offline data queues in     │ - Restrict settlement haircuts     │
  │   encrypted local database blocks. │   with strict approval limits.     │
  └────────────────────────────────────┴────────────────────────────────────┘
```

* **GPS Location Fraud:** Mobile check-ins require verified GPS coordinates, blocking coordinate bypass attempts or manual overrides.
* **Unauthorized Settlement Approvals:** Supervisors are restricted by strict approval thresholds based on their role level, with multi-level authorization required for large settlements.
* **Offline Data Security:** Local data queues on mobile devices are encrypted using device-specific keys, preventing unauthorized access if a device is lost.

---

## 13. VENDOR & THIRD-PARTY INTEGRATION RISKS

EDROS depends on third-party APIs for mapping, SMS routing, and payments. These dependencies are actively monitored to limit vendor risks:

* **SMS Gateway Delays:** Set up secondary backup gateways and configure the system to route traffic dynamically based on gateway latency metrics.
* **Mapping Service Failures:** Implement local coordinate caching and support graceful offline maps fallbacks on mobile clients.
* **API Key Exposure:** Store all integration secrets securely in KMS vaults, and rotate access keys every 90 days.

---

## 14. DECISION MATRIX & EMERGENCY RISK RESPONSE

To guide emergency responses, risk events are handled based on severity levels:

```
+───────────────────────────────────────────────────────────────────────────────+
|                             EMERGENCY RISK COMPASS                            |
+──────────────────────────┬────────────────────────────────────────────────────+
| CRITICAL RISK EXPOSURE   | Shut down affected APIs and notify regulators.     |
| HIGH OPERATIONAL THREAT  | Isolate affected servers and rotate credentials.   |
| MEDIUM WORKFLOW BLOCK    | Route tasks to backup services, update rules.      |
+──────────────────────────┴────────────────────────────────────────────────────+
```

### 14.1 Technical Response Pathways

* **Critical Risk Exposure (e.g., Active Security Leak):** Immediately disable the affected API routes, rotate database master credentials, notify compliance boards, and prepare reports for clients and regulatory authorities.
* **High Operational Threat (e.g., Database Replication Loss):** Isolate the affected database servers, promote the active-passive replica to master, and verify data consistency before resuming operations.
* **Medium Workflow Block (e.g., Primary SMS Gateway Outage):** Automatically route notifications through secondary backup gateways, notify on-call SREs, and monitor delivery success metrics.

---

## 15. REGULATORY COMPLIANCE MATRIX

Mitigation controls are mapped to regional regulations to ensure compliance across all operations:

| Regulation | Compliance Mandate | Enforced System Control | Verification Method |
| :--- | :--- | :--- | :--- |
| **DPDP Act (2023)** | Secure borrower personal data. | Encrypt data at rest using AES-256 and mask PII on general screens. | Audit database configurations and check interface displays. |
| **DPDP Act (2023)** | Maintain data consent records. | Log borrower consent for data processing in sealed database files. | Verify search results in the system audit portal. |
| **RBI Guidelines** | Restrict collection contact hours. | Enforce system lockout rules outside of permitted hours (08:00 to 19:00).| Attempt out-of-hours requests and verify lockouts. |
| **ISO 27001** | Maintain comprehensive system logs. | Log all state-modifying actions to immutable audit ledgers. | Review search results in the system audit portal. |

---

## 16. GOVERNANCE CONTROLS & SECURITY SEALS

Governance and risk boundaries are maintained through automated technical controls built directly into the platform:

* **Cryptographic PDF Seals:** Generated notices, case files, and court documents are encrypted with passwords before saving to secure R2 storage.
* **GPS Coordinate Auditing:** The platform checks GPS coords for every check-in, logging coordinate mismatch alerts to the audit trail.
* **Closed-Loop API Routing:** Next.js APIs connect to Neon PostgreSQL using pgBouncer connection strings with SSL enforced.

---

## 17. RISK MANAGEMENT KEY PERFORMANCE INDICATORS (KPIS)

Risk performance is tracked against key performance indicators (KPIs) to monitor platform defense metrics.

```
+─────────────────────────────────────────────────────────────────────────────+
| ENTERPRISE RISK MITIGATION PERFORMANCE TARGETS                              |
|                                                                             |
| Active Compliance Outages: [ Target: 0 Incidents ]                          |
| Average Failover Time:     [ Target: < 10 Seconds ]                         |
| Data Recovery Window:      [ Target: < 1 Hour Loss ]                        |
| Security Audit Pass Rate:  [ Target: 100% Correct ]                         |
+─────────────────────────────────────────────────────────────────────────────+
```

* **Active Compliance Outages:** Zero compliance infractions may occur during outreach campaigns.
* **Average Failover Time:** Database replica promotion must execute in `< 10 seconds` after master loss.
* **Data Recovery Window:** Automated backup structures must limit potential data loss to `< 1 hour` of transaction volume.

---

## 18. BEST PRACTICES & EXCELLENCE STRATEGIES

* **Implement Least Privilege:** Restrict database access and high-exposure transaction scopes to authorized roles matching their daily responsibilities.
* **Encrypt Environments:** Use separate, masked database branches for testing schemas and new features in development environments.
* **Review API Limits Regularly:** Periodically review rate-limiting parameters inside Upstash Redis, updating thresholds to block anomalous traffic spikes.

---

## 19. COMMON MISTAKES & RISK MITIGATION PITFALLS

* **Ignoring Background Queue Spikes:** Failing to monitor background queues can delay time-sensitive tasks, such as generating court notices or processing collections.
  * *Correction:* Monitor queue metrics daily, and scale Railway worker containers horizontally to handle sudden volume spikes.
* **Deploying Secrets in Source Code:** Committing database connection strings or third-party integration keys to version control exposes credentials to unauthorized developers.
  * *Correction:* Store all secrets securely in Vercel and Railway environment configurations, and rotate keys every 90 days.
* **Overriding Operational Hour Limits:** Allowing manual overrides to contact hour restrictions can result in compliance violations and regulatory penalties.
  * *Correction:* Enforce a hard lock on all outreach APIs outside of permitted contact hours.

---

## 20. AUDIT & VALIDATION CHECKLISTS

### 20.1 Technical Verification Checklist
* [ ] **Connection Check:** Confirm that all compute nodes connect to database pools using secure pgBouncer endpoints with SSL enforced.
* [ ] **Secret Check:** Verify that no active API keys, connection strings, or system secrets are included in the source code.
* [ ] **Audit Trail Active:** Confirm that state-modifying actions trigger sealed logs with matching user context.

### 20.2 Compliance Validation Checklist
* [ ] **Consent Log Check:** Verify that consent tracking is active and logging borrower data processing permissions.
* [ ] **PII Masking Check:** Confirm that sensitive debtor PII is masked on screens accessed by general field executives.
* [ ] **Outreach Time-Gate Check:** Confirm that the platform automatically locks out outreach tools outside of RBI-permitted hours.

---

## 21. REFERENCES & GLOSSARY

### 21.1 References
1. **ISO 31000:2018:** Risk Management Principles and Guidelines.
2. **NIST SP 800-30 Rev 1:** Guide for Conducting Risk Assessments.
3. **Reserve Bank of India (RBI):** Master Circular on Fair Practices Code for Lenders and Debt Collection Standards.
4. **Digital Personal Data Protection Act, 2023:** India’s framework for protecting personal identifiers and managing data consent.

### 21.2 Glossary of Terms
* **PITR:** Point-in-Time Recovery. The capability to restore a database to its exact state at a specific millisecond in the past.
* **SPOF:** Single Point of Failure. Any system component that, if disabled, causes an immediate interruption of business operations.
* **KMS:** Key Management Service. A secure cloud service used to store, manage, and rotate cryptographic keys.
* **pgBouncer:** A lightweight connection pooler for PostgreSQL that helps manage large volumes of serverless connections.
* **RBAC:** Role-Based Access Control. A method of restricting system access to authorized users based on their organizational role.

---

## 22. APPENDIX

### 22.1 Risk Incident Communication Protocol
When critical security incidents or system outages occur, the incident coordinator must alert the response team using the following escalation chain:

```
[ Incident Coordinator ] ──► [ CISO / CTO ] ──► [ Compliance Board ] ──► [ ESC Directors ]
```

* **Immediate Action (0 - 15 Minutes):** Contain the incident, isolate affected systems, and notify the CISO and CTO.
* **Evaluation (15 - 30 Minutes):** Assess system impact, estimate recovery times, and draft the initial incident report.
* **Communication (30 - 60 Minutes):** Notify affected clients and regulators in compliance with data privacy guidelines.

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
