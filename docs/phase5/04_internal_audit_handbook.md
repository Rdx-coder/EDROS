# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-GOV-AUD-004
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 4: INTERNAL AUDIT HANDBOOK

```
================================================================================
                    I N T E R N A L   A U D I T
                             H A N D B O O K
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Head of Internal Audit
Co-Authors:   Chief Compliance Officer (CCO), Lead Security Auditor
Reviewer:     Chief Risk Officer (CRO), Principal Platform Architect
Approver:     Chief Technology Officer & Audit Committee
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline release of the EDROS Internal Audit Handbook. | Head of Internal Audit | CTO & Audit Committee |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [APPLICABLE STANDARDS & REGULATORY MANDATES](#2-applicable-standards--regulatory-mandates)
3. [DEFINITIONS](#3-definitions)
4. [AUDIT POLICY & MANAGEMENT PHILOSOPHY](#4-audit-policy--management-philosophy)
5. [ROLES & AUDIT RESPONSIBILITIES](#5-roles--audit-responsibilities)
6. [AUDIT PLANNING & CRITERIA](#6-audit-planning--criteria)
7. [AUDIT SCOPE & BOUNDARIES](#7-audit-scope--boundaries)
8. [EVIDENCE COLLECTION & VALIDATION METHODOLOGY](#8-evidence-collection--validation-methodology)
9. [AUDIT REPORTING & SEVERITY CLASSIFICATION](#9-audit-reporting--severity-classification)
10. [CORRECTIVE & PREVENTIVE ACTIONS (CAPA) WORKFLOW](#10-corrective--preventive-actions-capa-workflow)
11. [FOLLOW-UP AUDITS & STATUS RESOLUTION](#11-follow-up-audits--status-resolution)
12. [DECISION MATRIX & AUDIT ESCALATION PATHWAYS](#12-decision-matrix--audit-escalation-pathways)
13. [AUDIT RISK MATRIX](#13-audit-risk-matrix)
14. [REGULATORY COMPLIANCE MATRIX](#14-regulatory-compliance-matrix)
15. [GOVERNANCE CONTROLS & MONITORING SEALS](#15-governance-controls--monitoring-seals)
16. [AUDIT KEY PERFORMANCE INDICATORS (KPIS)](#16-audit-key-performance-indicators-kpis)
17. [BEST PRACTICES & AUDIT EXCELLENCE](#17-best-practices--audit-excellence)
18. [COMMON MISTAKES & AUDITING PITFALLS](#18-common-mistakes--auditing-pitfalls)
19. [COMPREHENSIVE AUDIT CHECKLISTS](#19-comprehensive-audit-checklists)
20. [VALIDATION & SYSTEM CHECKLIST](#20-validation--system-checklist)
21. [REFERENCES & GLOSSARY](#21-references--glossary)
22. [APPENDIX](#22-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
The purpose of this document is to establish the definitive Internal Audit Handbook for the Enterprise Debt Recovery Operating System (EDROS) at Sanjay Dangi Associates. This handbook defines the mandatory operational procedures, auditing checklists, verification mechanisms, and evidence collection workflows required to evaluate the security, compliance, performance, and reliability of the EDROS ecosystem.

### 1.2 Scope
This handbook governs all internal audit operations, evaluations, and compliance assessments within the EDROS platform, including:
* **Infrastructure Security Audits:** Checking multi-cloud configurations across Vercel, Railway, Neon PostgreSQL, Upstash Redis, and Cloudflare.
* **Identity & Access Audits:** Reviewing Role-Based Access Control (RBAC) maps, API secret rotation, and MFA enforcement.
* **Operational Audits:** Verifying collection outreach hours, field executive GPS check-ins, and mobile data caches.
* **Regulatory Audits:** Confirming compliance with the Digital Personal Data Protection (DPDP) Act and Reserve Bank of India (RBI) Lending Guidelines.
* **Database & Integrity Audits:** Auditing transaction logs, schema migrations, and point-in-time recovery capabilities.

### 1.3 Target Audience
This handbook is prepared for:
* **The Head of Internal Audit and Internal Auditors** conducting regular compliance reviews and performance checks.
* **The Chief Compliance Officer (CCO) and Legal Counsel** verifying compliance with regional and international financial regulations.
* **SREs, DevOps Engineers, and Database Administrators (DBAs)** providing audit logs, system configurations, and system metrics.
* **Partner Bank Auditors, Enterprise Clients, and External ISO/IEC 27001 Inspectors** evaluating the platform's security and data protection controls.

---

## 2. APPLICABLE STANDARDS & REGULATORY MANDATES

The EDROS Internal Audit Handbook is designed to align with international auditing standards and regional guidelines:

* **ISO 19011:2018:** Guidelines for Auditing Management Systems.
* **ISO/IEC 27001:2022 Control A.5 - A.8:** Information security management and asset controls.
* **COBIT 2019 Framework:** Governance and management of enterprise IT.
* **Reserve Bank of India (RBI) Guidelines:** Guidelines on Fair Practices Code (FPC) and Information Security for asset reconstruction companies.
* **Digital Personal Data Protection (DPDP) Act, 2023:** Auditing customer consent management and personal data-purging actions.

> **CRITICAL LEGAL NOTICE:** Any regulatory frameworks, privacy acts, or compliance standards referenced in this handbook must be evaluated against the latest applicable legal and regulatory requirements prior to active deployment.

---

## 3. DEFINITIONS

* **Audit Evidence:** Verifiable records, statements of fact, or other information relevant to audit criteria and used to support audit findings.
* **Non-Conformity (NC):** The non-fulfillment of a specified requirement, regulatory rule, or internal security policy.
* **Corrective and Preventive Action (CAPA):** A structured process used to investigate, resolve, and prevent the recurrence of identified non-conformities.
* **Cryptographic Hash Verification:** A process used to verify audit trail integrity by checking that log file hashes match their original baseline signatures.
* **Root Cause Analysis (RCA):** A structured problem-solving method used to identify the fundamental cause of a failure or non-conformity.

---

## 4. AUDIT POLICY & MANAGEMENT PHILOSOPHY

### 4.1 Audit Policy
All components, data pathways, and user sessions within the EDROS platform must undergo regular, structured audits. Accessing production data or modifying system configurations must be done in a traceable manner, ensuring every action is recorded in the immutable system audit trail.

```
┌─────────────────────────────────────────────────────────────┐
│                 AUDIT OPERATIONS HIERARCHY                  │
├───────────────┬─────────────────────────────────────────────┤
│ LEVEL 1       │ Continuous Logging (Automated Audit Trails) │
├───────────────┼─────────────────────────────────────────────┤
│ LEVEL 2       │ Monthly Reviews (Role & Secret Verifications)│
├───────────────┼─────────────────────────────────────────────┤
│ LEVEL 3       │ Quarterly Internal Audits (SOP Compliance)  │
├───────────────┼─────────────────────────────────────────────┤
│ LEVEL 4       │ Annual External Inspections (ISO & SOC 2)   │
└───────────────┴─────────────────────────────────────────────┘
```

### 4.2 Key Auditing Objectives
* **Verify Security Controls:** Confirm that encryption protocols (AES-256, TLS 1.3), network firewalls (WAF), and access limits are active and effective.
* **Validate Compliance:** Confirm that outreach activities, mobile GPS tracking, and data storage match regulatory boundaries.
* **Ensure Operational Integrity:** Verify that settlement approvals, caseload allocations, and HR onboarding workflows follow approved SOPs.
* **Preserve Traceability:** Confirm that all state-modifying actions trigger cryptographically sealed, tamper-proof logs.

---

## 5. ROLES & AUDIT RESPONSIBILITIES

Conducting internal audits and resolving findings is a shared responsibility managed across distinct organizational roles:

```
[ Audit Governance Structure ]
               │
               ├──► Audit Committee - Approves Audit Plan & Reviews Findings
               │
               ├──► Head of Internal Audit - Coordinates Audits & Evidence
               │
               ├──► Chief Compliance Officer - Reviews Regulatory Compliance
               │
               └──► SREs, DBAs, & Developers - Provide Logs & Implement CAPAs
```

* **Audit Committee:** Reviews and signs off on the annual audit plan, evaluates high-priority findings, and monitors corrective action progress.
* **Head of Internal Audit:** Coordinates internal audits, manages evidence collection, and drafts audit reports for the committee.
* **Chief Compliance Officer (CCO):** Verifies that audit scopes and findings align with regional banking regulations and data privacy standards.
* **SREs, DBAs, & Developers:** Responsible for providing system logs, explaining configurations, and implementing technical corrective actions to resolve non-conformities.

---

## 6. AUDIT PLANNING & CRITERIA

Audits must be planned and executed on a structured schedule to prevent operational disruption and ensure comprehensive coverage:

* **Annual Audit Plan:** The Head of Internal Audit drafts the Annual Audit Plan, mapping out audit scopes, resource allocations, and schedule targets for the upcoming year.
* **Audit Announcement:** The audit team notifies target departments at least 10 business days before starting a scheduled audit, providing the audit scope and required evidence checklists.
* **Audit Criteria:** Evaluations are conducted against predefined baselines, including internal SOPs, security guidelines, SLA targets, and regulatory standards.

---

## 7. AUDIT SCOPE & BOUNDARIES

To manage auditing resources effectively, evaluations are isolated to specific domains:

```
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  A. INFRASTRUCTURE & TECH    │              │    B. IDENTITY & SECURITY    │
├──────────────────────────────┤              ├──────────────────────────────┤
│ - Vercel API & UI Config     │              │ - RBAC Access Control Maps   │
│ - Railway Worker Containers  │              │ - API Key & Secret Rotation  │
│ - Neon Database & Backups    │              │ - MFA Token Enforcement      │
└──────────────────────────────┘              └──────────────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  C. OPERATIONAL COMPLIANCE   │              │     D. REGULATORY & PRIVACY  │
├──────────────────────────────┤              ├──────────────────────────────┤
│ - Outreach Contact Hours     │              │ - Data Consent Records       │
│ - Mobile GPS & Geofencing    │              │ - PII Masking Configurations │
│ - Settlement Haircut Levels  │              │ - Data Erasure & Purging     │
└──────────────────────────────┘              └──────────────────────────────┘
```

---

## 8. EVIDENCE COLLECTION & VALIDATION METHODOLOGY

Auditors must collect objective, verifiable evidence to support audit findings. Standard evidence collection methods include:

### 8.1 System Configuration Exports
Auditors verify configuration settings by exporting parameters directly from production systems, such as:
* Checking Cloudflare WAF configurations to confirm SQLi and XSS protections are active.
* Exporting database connection strings to verify that pgBouncer endpoints and SSL requirements are configured.

### 8.2 Database Query Validation
Auditors run read-only SQL queries to verify data integrity and compliance, such as:
* Checking that debtor records have corresponding, active consent markers in the database:
  ```sql
  SELECT tenant_id, count(case_id) 
  FROM edros_cases 
  WHERE consent_status != 'GRANTED' 
  GROUP BY tenant_id;
  ```

### 8.3 Screen Captures & User Observations
* **Field Process Audits:** Auditors observe and document mobile check-ins, verifying that GPS coordinates match the branch's geofenced boundaries.
* **Administrative Approvals:** Auditors review settlement approvals, verifying that haircut levels require appropriate authorization before processing.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: System Audit Log Search                      |
| Capture the system audit portal UI with completed search filters, showing   |
| the cryptographic payload hash values and immutable timestamp details.     |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 9. AUDIT REPORTING & SEVERITY CLASSIFICATION

Audit findings are compiled into an Audit Report and classified based on severity to guide remediation efforts:

| Severity Level | Description of Non-Conformity | Business / Security Impact | Required CAPA Response Time |
| :--- | :--- | :--- | :---: |
| **Critical** | Critical security vulnerability, data leakage exposing PII, or severe compliance breach. | High risk of data loss, regulatory penalties, or systemic outages. | Within 24 Hours |
| **Major** | Significant process failure, incomplete audit trails, or bypass of standard approval thresholds. | Increased risk of unauthorized transactions or compliance warnings. | Within 7 Days |
| **Minor** | Incomplete training records, minor documentation gaps, or slight latency SLA deviations. | Low risk of immediate operational disruption or regulatory action. | Within 30 Days |
| **Observation**| Opportunity for improvement, optimized configurations, or procedural enhancements. | Minimal impact on security or compliance. | Optional / As Scheduled |

---

## 10. CORRECTIVE & PREVENTIVE ACTIONS (CAPA) WORKFLOW

When non-conformities are identified, the auditing and operations teams execute a structured Corrective and Preventive Action (CAPA) workflow to resolve the issue and prevent recurrence.

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ 1. Incident   │─────►│ 2. Root Cause │─────►│ 3. Remediation│─────►│ 4. Verification│
│    Logging    │      │    Analysis   │      │    Execution  │      │    & Closure  │
└───────────────┘      └───────────────┘      └───────────────┘      └───────────────┘
```

1. **Incident Logging:** The auditor registers the non-conformity in the system CAPA tracker, detailing the finding, severity, and associated evidence.
2. **Root Cause Analysis (RCA):** The responsible department lead conducts an RCA (using the "5 Whys" method) to identify the fundamental cause of the issue.
3. **Remediation Execution:** SREs or developers implement technical or procedural fixes (such as updating configuration files or adding input validation checks) to resolve the vulnerability.
4. **Verification & Closure:** The auditor verifies that the fix is effective, runs system checks, and updates the CAPA record to `Closed`.

---

## 11. FOLLOW-UP AUDITS & STATUS RESOLUTION

To ensure that corrective actions are permanent, the audit team schedules systematic follow-up audits:

* **Scheduling:** Follow-up checks are scheduled based on finding severity (e.g., 5 business days after a Critical finding resolution, 30 days for Major, and 90 days for Minor).
* **Validation:** The auditor re-evaluates the system, runs verification queries, and checks active configurations.
* **Escalation:** If a finding is not resolved within the target CAPA timeline, the issue is escalated to the Audit Committee for executive review.

---

## 12. DECISION MATRIX & AUDIT ESCALATION PATHWAYS

To handle unresolved or severe audit findings, issues are routed through standardized escalation paths:

```
+───────────────────────────────────────────────────────────────────────────────+
|                            AUDIT ESCALATION COMPASS                           |
+──────────────────────────┬────────────────────────────────────────────────────+
| UNRESOLVED CRITICAL NC   | Stop affected systems and notify Board Directors.   |
| DELAYED MAJOR CAPA       | Escalate to the Audit Committee and C-Suite.       |
| PENDING MINOR CORRECTION | Review during standard monthly operations meetings. |
+──────────────────────────┴────────────────────────────────────────────────────+
```

### 12.1 Technical Escalation Pathways

* **Unresolved Critical NC (e.g., Active API Vulnerability):** Immediately disable the affected API routes, notify the CISO and CTO, and prepare reports for the board.
* **Delayed Major CAPA (e.g., Incomplete Secret Rotation):** Escalate the issue to the CCO and department VP, schedule an emergency remediation meeting, and monitor progress daily.
* **Pending Minor Correction (e.g., Document Formatting Gap):** Review the status during monthly department meetings, and assign resources to complete the task within standard quarterly cycles.

---

## 13. AUDIT RISK MATRIX

Potential risks to the auditing process itself are tracked and managed to protect audit independence and completeness:

| Identifier | Risk Description | Probability | Impact Severity | Audit Mitigation Action |
| :--- | :--- | :---: | :---: | :--- |
| **AUD-RSK-01** | Compromised or modified system audit logs. | Low | Critical | Use cryptographically sealed, write-once-read-many (WORM) storage for audit records. |
| **AUD-RSK-02** | Missing or incomplete database transaction trails. | Medium | High | Enable transaction logging in Neon PostgreSQL, tracking all state-modifying queries. |
| **AUD-RSK-03** | Lack of administrative access during audits. | Low | High | Establish pre-authorized, read-only audit roles in Vercel, Railway, and Neon consoles. |
| **AUD-RSK-04** | Incomplete mobile field check-in evidence. | Medium | Medium | Require GPS coordinates and site photos for all mobile visit records. |

---

## 14. REGULATORY COMPLIANCE MATRIX

Auditable controls are mapped to regional regulations to ensure compliance across all operations:

| Regulation | Compliance Mandate | Auditable System Control | Verification Method |
| :--- | :--- | :--- | :--- |
| **DPDP Act (2023)** | Secure borrower personal data. | Encrypt data at rest using AES-256 and mask PII on general screens. | Audit database configurations and check interface displays. |
| **DPDP Act (2023)** | Log borrower consent data. | Record borrower consent status, source, and timestamps in database. | Run verification queries on case records. |
| **RBI Guidelines** | Restrict collection contact hours. | Enforce system lockout rules outside of permitted hours (08:00 to 19:00).| Attempt out-of-hours requests and verify lockouts. |
| **ISO 27001** | Maintain comprehensive system logs. | Log all state-modifying actions to immutable audit ledgers. | Review search results in the system audit portal. |

---

## 15. GOVERNANCE CONTROLS & MONITORING SEALS

Audit trail integrity is maintained through technical controls built directly into the platform:

* **Cryptographic Signatures:** Every entry in the system audit trail is cryptographically signed, preventing unauthorized modifications or deletions.
* **Read-Only Audit Roles:** Audit staff are assigned dedicated, read-only roles in production consoles, ensuring they can collect evidence without risking accidental changes.
* **Automated Log Backups:** System and transaction logs are automatically backed up daily to secure Cloudflare R2 buckets, preserving historical records for long-term review.

---

## 16. AUDIT KEY PERFORMANCE INDICATORS (KPIS)

Auditing efficiency and coverage are tracked against key performance indicators (KPIs) to monitor compliance levels.

```
+─────────────────────────────────────────────────────────────────────────────+
| KEY PERFORMANCE AUDITING TARGETS                                            |
|                                                                             |
| Scheduled Audit Completion: [ Target: 100% On-Time ]                         |
| Average CAPA Resolve Time:  [ Target: < 48 Hours ]                          |
| Audit Log Verification:     [ Target: 100% Verified ]                        |
| Repeat Non-Conformities:    [ Target: 0 Cases ]                              |
+─────────────────────────────────────────────────────────────────────────────+
```

* **Scheduled Audit Completion:** 100% of planned internal audits must be completed within the target quarter.
* **Average CAPA Resolve Time:** Critical findings must be resolved and verified within 48 hours of logging.
* **Audit Log Verification:** 100% of checked system logs must pass cryptographic hash validation.

---

## 17. BEST PRACTICES & AUDIT EXCELLENCE

* **Conduct Dry Runs:** Perform mock audits annually to prepare the operations team and verify that evidence collection pathways are functioning.
* **Automate Evidence Generation:** Set up automated reporting templates to extract log files and system configuration states, reducing audit overhead.
* **Implement Continuous Monitoring:** Use real-time alerts to detect potential compliance deviations (such as out-of-hours outreach attempts) before they escalate to non-conformities.

---

## 18. COMMON MISTAKES & AUDITING PITFALLS

* **Auditing Self-Created Systems:** Allowing engineers to audit components they designed introduces conflicts of interest.
  * *Correction:* Maintain a strict segregation of duties, ensuring all audits are conducted by independent audit staff.
* **Relying on Manual Log Exports:** Exporting system logs manually during audits can delay evidence collection and risk data omissions.
  * *Correction:* Automate log exports using structured pipelines, delivering evidence files directly to auditors.
* **Ignoring Minor Non-Conformities:** Failing to address minor findings can lead to systematic process failures and larger compliance risks over time.
  * *Correction:* Track all findings in the system CAPA desk, requiring formal resolution and validation for every non-conformity.

---

## 19. COMPREHENSIVE AUDIT CHECKLISTS

### 19.1 Technical Audit Checklist

#### Vercel & API Security
* [ ] Confirm that Next.js API routes require secure user JWTs for authentication.
* [ ] Verify that session cookies are configured with `HttpOnly`, `Secure`, and `SameSite=Strict` flags.
* [ ] Check that no active API keys or credentials are included in the source code.

#### Database Security & Backups
* [ ] Confirm that database connections use secure pgBouncer endpoints with SSL enforced.
* [ ] Verify that automated Neon PostgreSQL backups are executing successfully daily.
* [ ] Test point-in-time recovery (PITR) to confirm that the database can be restored to a specific past second.

---

### 19.2 Compliance Audit Checklist

#### Data Privacy (DPDP)
* [ ] Verify that customer consent status and timestamps are logged for all processed cases.
* [ ] Confirm that sensitive borrower PII is masked on screens accessed by general field executives.
* [ ] Check that data-purging routines are active, removing records in compliance with data retention schedules.

#### Operational Collection (RBI)
* [ ] Confirm that the platform automatically disables outreach tools outside of RBI-permitted hours.
* [ ] Verify that mobile check-ins check GPS coordinates, blocking check-ins outside of branch geofences.
* [ ] Audit settlement approvals to confirm that haircuts conform to approved role thresholds.

---

## 20. VALIDATION & SYSTEM CHECKLIST

Before concluding an audit, verify that all auditing pathways are active and secure:

* [ ] **Log Completeness:** Confirm that all state-modifying actions trigger sealed logs with matching user context.
* [ ] **Access Isolation:** Verify that audit staff accounts are restricted to read-only permissions in production consoles.
* [ ] **Backup Security:** Check that log backups saved in Cloudflare R2 are encrypted and restricted from public access.
* [ ] **CAPA Tracking:** Confirm that all active non-conformities have corresponding, assigned CAPA records in the system tracker.

---

## 21. REFERENCES & GLOSSARY

### 21.1 References
1. **ISO 19011:2018:** Guidelines for Auditing Management Systems.
2. **COBIT 2019 Framework:** Governance and Management of Enterprise IT.
3. **Reserve Bank of India (RBI):** Directions on Information Security and Debt Collection Standards.
4. **Digital Personal Data Protection Act, 2023:** Act No. 26 of 2023, Government of India.

### 21.2 Glossary of Terms
* **CAPA:** Corrective and Preventive Action. A structured process used to resolve and prevent the recurrence of non-conformities.
* **Audit Trail:** An immutable, chronological record of system events and database updates.
* **MFA:** Multi-Factor Authentication. Requires multiple independent credentials to verify user identity.
* **PII:** Personally Identifiable Information. Data that can be used to identify an individual (e.g., national identifiers, phone numbers).
* **WORM:** Write Once, Read Many. Storage technology that prevents data from being modified or deleted after writing.

---

## 22. APPENDIX

### 22.1 CAPA Record Log Template
When a non-conformity is identified, the auditor must log the details using the following structured template:

```
CAPA RECORD LOG:
Record ID:      CAPA-EDROS-2026-0042
Severity:       Major
Date Logged:    2026-07-15 02:50:00 UTC
Audit Domain:   Identity & Security
Finding:        Incomplete secret rotation across background worker configurations.
Root Cause:     Lack of automated reminders for rotating API credentials.
Remediation:    Configure automated alerts in the KMS system to notify SREs.
Verification:   Confirmed automated alerts are active and verified credential rotation.
Status:         CLOSED (Verified by Lead Auditor)
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
