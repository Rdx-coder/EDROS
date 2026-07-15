# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-GOV-002
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 1: ENTERPRISE GOVERNANCE FRAMEWORK

```
================================================================================
              E N T E R P R I S E   G O V E R N A N C E
                           F R A M E W O R K
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Chief Enterprise Governance Officer (CEGO)
Co-Authors:   Chief Information Security Officer (CISO), Chief Compliance Officer (CCO)
Reviewer:     Chief Risk Officer (CRO), Chief Product Officer (CPO)
Approver:     Chief Technology Officer & Steering Committee
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline publication of the Enterprise Governance Framework for EDROS. | Chief Enterprise Governance Officer | CTO & Steering Committee |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [APPLICABLE STANDARDS & REGULATORY MANDATES](#2-applicable-standards--regulatory-mandates)
3. [DEFINITIONS](#3-definitions)
4. [GOVERNANCE VISION & GOVERNANCE PRINCIPLES](#4-governance-vision--governance-principles)
5. [GOVERNANCE STRUCTURE & COMMITTEE HIERARCHY](#5-governance-structure--committee-hierarchy)
6. [ROLES & EXECUTIVE RESPONSIBILITIES](#6-roles--executive-responsibilities)
7. [DECISION-MAKING FRAMEWORK & DECISION MATRIX](#7-decision-making-framework--decision-matrix)
8. [APPROVAL AUTHORITY MATRIX](#8-approval-authority-matrix)
9. [POLICY MANAGEMENT & LIFE-CYCLE PROCEDURES](#9-policy-management--life-cycle-procedures)
10. [DOCUMENT CONTROL & VERSION REGISTRY](#10-document-control--version-registry)
11. [RISK MATRIX & ENTERPRISE RISK REVENUE COUPLING](#11-risk-matrix--enterprise-risk-revenue-coupling)
12. [COMPLIANCE MATRIX](#12-compliance-matrix)
13. [GOVERNANCE CONTROLS & SECURITY SEALS](#13-governance-controls--security-seals)
14. [GOVERNANCE KEY PERFORMANCE INDICATORS (KPIS)](#14-governance-key-performance-indicators-kpis)
15. [BEST PRACTICES & GOVERNANCE ADVOCACY](#15-best-practices--governance-advocacy)
16. [COMMON MISTAKES & GOVERNANCE PITFALLS](#16-common-mistakes--governance-pitfalls)
17. [AUDIT & VALIDATION CHECKLISTS](#17-audit--validation-checklists)
18. [REFERENCES](#18-references)
19. [GLOSSARY](#19-glossary)
20. [APPENDIX](#20-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
The purpose of this document is to establish the definitive Enterprise Governance Framework for the Enterprise Debt Recovery Operating System (EDROS) at Sanjay Dangi Associates. This framework defines the leadership, organizational structures, regulatory boundaries, and decision-making policies required to ensure that the platform operates with high integrity, absolute compliance, and maximum operational reliability.

### 1.2 Scope
This framework governs the entire life-cycle of the EDROS platform, including:
* **Strategic Oversight:** Aligning platform capabilities with corporate and financial targets.
* **Risk & Compliance Management:** Maintaining alignment with regional and international financial regulations.
* **Operational Control:** Defining the approval thresholds, executive responsibilities, and committee structures.
* **Documentation & Audit Control:** Enforcing systematic versioning, policy management, and document classifications.

### 1.3 Target Audience
This document is prepared for:
* **Board of Directors & C-Suite Executives** seeking a high-level view of governance compliance.
* **SREs, DBAs, and System Architects** verifying operational alignment with technical policies.
* **Internal and External Auditors** assessing procedural conformity during regulatory inspections.
* **Regulatory Authorities (such as RBI Inspectors)** verifying systemic data protections and legal boundaries.

---

## 2. APPLICABLE STANDARDS & REGULATORY MANDATES

EDROS operates within a complex financial and data security landscape. The governance framework is built to align with regional guidelines and international standards:

```
┌─────────────────────────────────────────────────────────────┐
│                 REGULATORY & COMPLIANCE PILOT               │
├───────────────┬─────────────────────────────────────────────┤
│ ISO 27001     │ Information Security Management Standards   │
├───────────────┼─────────────────────────────────────────────┤
│ ISO 9001      │ Quality Management Standards                │
├───────────────┼─────────────────────────────────────────────┤
│ ISO 22301     │ Business Continuity Standards               │
├───────────────┼─────────────────────────────────────────────┤
│ RBI DLG       │ Digital Lending Guidelines (India)          │
├───────────────┼─────────────────────────────────────────────┤
│ DPDP Act      │ Digital Personal Data Protection Act (2023) │
├───────────────┼─────────────────────────────────────────────┤
│ NIST CSF      │ NIST Cybersecurity Framework                │
└───────────────┴─────────────────────────────────────────────┘
```

> **CRITICAL LEGAL NOTICE:** Any mention of regulatory standards, data privacy acts (including the DPDP Act 2023), and financial rules (including RBI guidelines) in this framework must be reviewed against the latest applicable legal and regulatory requirements prior to actual production deployment. Sanjay Dangi Associates maintains a bi-annual review schedule to adapt systemic rules to shifting legislative landscapes.

---

## 3. DEFINITIONS

* **Sovereign Tenant:** An isolated data space dedicated to a specific financial client (e.g. State Bank of India). This ensures complete isolation of client databases, transaction logs, and customer portfolios.
* **Haircut:** The percentage of a debt's principal or total outstanding balance that a creditor agrees to write off to settle the account.
* **Operating Window:** The legally permitted hours of outreach (voice calls, messages, physical visits) defined by regional financial regulators.
* **Escalation Chain:** The structured pathway of roles through which high-priority cases or system alerts are routed when local resolution limits are exceeded.
* **Metadata Envelope:** The structured header (containing system ID, version, and classification flags) that must be appended to all technical and business documents.

---

## 4. GOVERNANCE VISION & GOVERNANCE PRINCIPLES

### 4.1 Governance Vision
The governance vision of EDROS is to establish a transparent, compliant, and highly accountable recovery ecosystem that balances operational performance with borrower data protections. By automating compliance boundaries and security controls, EDROS aims to eliminate operational errors and maintain complete auditability.

### 4.2 Core Governance Principles

#### 1. Individual Accountability
Every system action—from case ingestion to settlement approvals—must be traceable to a specific, verified user profile, preventing unauthorized modifications.

#### 2. Segregation of Duties (SoD)
System roles must remain isolated. Staff who handle debtor portfolios must not have permissions to modify core system settings, custom database parameters, or cryptographic keys.

#### 3. Proportional Risk Management
Operational risk controls must scale with transaction and balance volumes. Higher-balance cases require extra operational validations and executive approvals.

#### 4. Continuous Auditability
Every transaction, security change, and system-state update must trigger an immutable, cryptographically sealed audit trail to support internal and regulatory audits.

#### 5. Data Minimization & Privacy
In compliance with the DPDP Act, only the minimum personal data required to complete a collection action may be processed or exposed to field agents.

---

## 5. GOVERNANCE STRUCTURE & COMMITTEE HIERARCHY

To maintain system oversight, EDROS defines three functional governance committees that manage the platform's strategic, technical, and compliance states.

```
                  ┌────────────────────────────────────────┐
                  │      Executive Steering Committee      │
                  │   - Strategic and Financial Alignment  │
                  └───────────────────┬────────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
┌───────────────────────────────────────┐           ┌───────────────────────────────────────┐
│     Architecture & Security Board     │           │    Compliance & Risk Management Board │
│ - Technical Design & Systems Security │           │ - Audits, Regulations, and DPDP Gates │
└───────────────────────────────────────┘           └───────────────────────────────────────┘
```

### 5.1 Executive Steering Committee (ESC)
* **Objective:** Directs the overall platform strategy, signs off on major software releases, and reviews monthly recovery metrics.
* **Chairperson:** Founder / Board Representative.
* **Members:** CTO, CFO, VP Operations.

### 5.2 Architecture & Security Board (ASB)
* **Objective:** Approves infrastructure changes, reviews system performance, and audits security controls.
* **Chairperson:** Chief Technology Officer.
* **Members:** Principal Solution Architect, CISO, DevOps Lead.

### 5.3 Compliance & Risk Management Board (CRB)
* **Objective:** Reviews system compliance against regional banking rules (RBI) and data privacy laws (DPDP).
* **Chairperson:** Chief Compliance Officer.
* **Members:** Legal Counsel, CRO, Data Protection Officer (DPO).

---

## 6. ROLES & EXECUTIVE RESPONSIBILITIES

To prevent operational conflicts and ensure accountability, key executive roles are mapped to specific platform governance responsibilities:

```
┌─────────────────────────────────────────────────────────────┐
│               EXECUTIVE RESPONSIBILITY MAPPING              │
├───────────────┬─────────────────────────────────────────────┤
│ CTO           │ Directs infrastructure security and uptime  │
├───────────────┼─────────────────────────────────────────────┤
│ CISO          │ Manages cryptographic keys and cyber defense│
├───────────────┼─────────────────────────────────────────────┤
│ CCO / DPO     │ Reviews data consent logs and DPDP gates    │
├───────────────┼─────────────────────────────────────────────┤
│ VP Operations │ Oversees case distribution and targets      │
└───────────────┴─────────────────────────────────────────────┘
```

* **Chief Technology Officer (CTO):** Accountable for overall platform uptime, infrastructure security, and system stability. Reviews all high-level architectural updates.
* **Chief Information Security Officer (CISO):** Manages cryptographic keys, JWT rotating secrets, and cyber defense systems. Oversees incident response plans.
* **Chief Compliance Officer / Data Protection Officer (CCO/DPO):** Responsible for verifying that data processing complies with regional laws. Manages data consent logs and data-purging actions.
* **VP of Operations:** Manages case distribution strategies, branch allocation balances, monthly recovery targets, and supervisor performance audits.

---

## 7. DECISION-MAKING FRAMEWORK & DECISION MATRIX

Every structural change inside EDROS must be routed through a standardized technical evaluation.

### 7.1 Decision Evaluation Pathway
1. **Proposal Initiation:** The requesting team drafts an Architecture Decision Record (ADR) outlining the business case and technical impact.
2. **Impact Assessment:** SRE, Database, and Security teams evaluate resource requirements and potential security risks.
3. **Board Presentation:** The proposal is submitted to the corresponding board (ASB or CRB) for review.
4. **Approval & Deployment:** Approved changes are merged into the staging pipeline, tested, and released to production.

---

## 8. APPROVAL AUTHORITY MATRIX

To prevent financial exposure, settlement haircuts and case write-offs are restricted by strict approval thresholds based on organizational hierarchy:

| Recovery Action Type | Limit Boundary / Threshold | Primary Initiator | Approving Authority | Verification Gate |
| :--- | :---: | :--- | :--- | :--- |
| **Standard Settlement** | Haircut up to 15.00% | Field Recovery Agent | Branch Manager | Local system validation |
| **Mid-Tier Settlement** | Haircut 15.01% to 30.00%| Field Recovery Agent | Regional Manager | Digital signature check |
| **High-Exposure Settlement**| Haircut 30.01% to 50.00%| Branch Manager | State Manager | Secure OTP authorization |
| **Exceptional Settlement** | Haircut > 50.00% | Regional Manager | National Operations Head | Double-signature audit |
| **Portfolio Ingestion** | No Limit | Bank Integration Lead | Super Administrator | Tenant validation check |
| **Custom Role Creation** | No Limit | Compliance Auditor | CTO & CISO | Multi-board authorization |

---

## 9. POLICY MANAGEMENT & LIFE-CYCLE PROCEDURES

Enterprise policies are reviewed, updated, and managed through a standardized policy lifecycle to prevent documentation decay and ensure compliance.

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ 1. Plan &     │─────►│ 2. Audit &    │─────►│ 3. Approve &  │─────►│ 4. Retire &   │
│    Draft      │      │    Review     │      │    Publish    │      │    Archive    │
└───────────────┘      └───────────────┘      └───────────────┘      └───────────────┘
```

1. **Drafting:** Subject matter experts write new policy drafts using standardized document templates.
2. **Review:** The corresponding board (ASB or CRB) reviews the draft, checking for technical accuracy and compliance alignment.
3. **Approval:** The policy is signed off by the document Owner and published to the corporate portal.
4. **Archival:** Outdated policies are retired, archived in a secure, read-only volume, and replaced with updated documentation.

---

## 10. DOCUMENT CONTROL & VERSION REGISTRY

Every document in the EDROS system is tracked using a standardized metadata header to preserve version history and define access permissions.

### 10.1 Metadata Registry Template
```yaml
---
id: EDROS-GOV-002
title: Enterprise Governance Framework
version: 1.0.0
classification: LEVEL-3 (CONFIDENTIAL)
owner_role: Chief Enterprise Governance Officer
reviewer_role: Chief Risk Officer
approver_role: Chief Technology Officer
last_reviewed: 2026-07-15
next_review_due: 2027-01-15
status: APPROVED
priority: CRITICAL
---
```

---

## 11. RISK MATRIX & ENTERPRISE RISK REVENUE COUPLING

Potential risks are tracked alongside mitigation strategies and financial impacts to ensure platform stability:

| Risk Domain Identifier | Probability | Impact Severity | Financial Exposure | System Mitigation Action |
| :--- | :---: | :---: | :--- | :--- |
| **RSK-COMP-001 (Data Leakage)** | Low | Critical | High | Encrypt database storage at rest, mask PII in dashboards, and encrypt secure PDFs with server-side RC4 seals. |
| **RSK-OPS-002 (Geofence Bypass)**| Medium | Medium | Medium | Require browser-level coordinate checks and cross-reference locations against branch geofences. |
| **RSK-TECH-003 (Connection Loss)**| Medium | High | High | Implement pgBouncer connection pools and set robust query timeouts. |
| **RSK-REG-004 (Contact Violations)**| Low | High | High | Enforce a hard lock on all outreach APIs outside of RBI-permitted hours. |

---

## 12. COMPLIANCE MATRIX

System compliance is verified against regional and international requirements using a structured compliance matrix:

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         SYSTEM COMPLIANCE CHECKS                        │
  ├────────────────────────────────────┬────────────────────────────────────┤
  │ DPDP CONSENT VALIDATION            │ RBI CONTACT HOURS ENFORCEMENT      │
  │ - Explicit Consent Tracker Active  │ - Automatically Lock Mobile Apps   │
  │ - PII Data Masking Configured      │ - Lock Communications Gateways     │
  └────────────────────────────────────┴────────────────────────────────────┘
```

* **DPDP Consent Tracking:** Confirm that explicit customer consent is logged for all data processing actions.
* **PII Data Masking:** Verify that sensitive customer data (such as phone numbers and national identifiers) is masked on screens accessed by general staff.
* **RBI Contact Hours:** Ensure the system automatically locks out outreach tools outside of permitted contact hours (usually 08:00 to 19:00).

---

## 13. GOVERNANCE CONTROLS & SECURITY SEALS

Governance rules are enforced through automated technical controls built directly into the platform:

* **Cryptographic Signatures:** High-exposure transactions (such as exceptional settlement approvals) require digital signatures to verify authorization.
* **Time-Gate Controls:** The platform automatically disables outreach APIs outside of permitted contact hours.
* **Closed-Loop Geofencing:** Field check-ins require coordinate validation against branch-assigned geofences to ensure the team is on-site.

---

## 14. GOVERNANCE KEY PERFORMANCE INDICATORS (KPIS)

Governance performance is tracked using key performance indicators (KPIs) to monitor platform health and compliance.

```
+─────────────────────────────────────────────────────────────────────────────+
| GOVERNANCE PERFORMANCES METRIC TARGETS                                      |
|                                                                             |
| Consent Validity Rating:   [ Target: 100% ]                                 |
| Out-of-Hours Exceptions:   [ Target: 0 Cases ]                              |
| Unlocked Security Audits:  [ Target: 100% Locked ]                          |
| System Latency Target:     [ Target: < 150ms ]                              |
+─────────────────────────────────────────────────────────────────────────────+
```

* **Consent Validity Rating:** 100% of processed cases must have matching, active consent records logged.
* **Out-of-Hours Exceptions:** Zero outreach attempts may occur outside of permitted contact hours.
* **Security Audit Locks:** 100% of state-modifying actions must trigger cryptographically sealed audit records.

---

## 15. BEST PRACTICES & GOVERNANCE ADVOCACY

* **Review Permissions Quarterly:** Regularly audit role permissions, removing unused access scopes from user accounts to maintain security boundaries.
* **Automate Schema Validations:** Always run database migrations through the staging pipeline to verify structure integrity before applying changes to production.
* **Test Backups Regularly:** Run automated recovery drills monthly to confirm that database backups can be restored within recovery time targets.

---

## 16. COMMON MISTAKES & GOVERNANCE PITFALLS

* **Allowing Manual Database Modifications:** Performing manual database updates bypasses Prisma, creating schema drift and leaving no history in the system audit trail.
  * *Correction:* All schema and record updates must be applied through standard migrations and tracked system portals.
* **Deploying Configuration Secrets in Code:** Committing API keys or database connection strings to the Git repository exposes credentials to unauthorized developers.
  * *Correction:* Store all secrets securely in Vercel and Railway environment configurations, and rotate keys every 90 days.
* **Overriding Contact Hour Restrictions:** Allowing supervisors to bypass contact hour limits can result in regulatory penalties and compliance audits.
  * *Correction:* Enforce a hard lockout on all outreach tools outside of permitted contact hours.

---

## 17. AUDIT & VALIDATION CHECKLISTS

### 17.1 Technical Verification Checklist
* [ ] **Connection Check:** Confirm that all compute nodes connect to database pools using secure pgBouncer endpoints.
* [ ] **Secret Check:** Verify that no active API keys, connection strings, or system secrets are included in the source code.
* [ ] **Audit Trail Active:** Confirm that state-modifying actions trigger sealed logs with matching user context.

### 17.2 Compliance Audit Checklist
* [ ] **Consent Log Check:** Verify that consent tracking is active and logging borrower data processing permissions.
* [ ] **Data Masking Check:** Confirm that sensitive debtor PII is masked on screens accessed by general field executives.
* [ ] **Outreach Time-Gate Check:** Confirm that the platform automatically locks out outreach tools outside of RBI-permitted hours.

---

## 18. REFERENCES

1. **Reserve Bank of India (RBI):** Digital Lending Guidelines (DLG) and Debt Collection Standards.
2. **Digital Personal Data Protection Act, 2023:** Act No. 26 of 2023, Government of India.
3. **ISO/IEC 27001 Security Standards:** Guidelines for establishing and auditing information security management systems.
4. **NIST Cybersecurity Framework:** Cybersecurity standards and guidelines used to protect enterprise platforms.

---

## 19. GLOSSARY

* **ESC:** Executive Steering Committee. Coordinates platform strategy and monthly performance reviews.
* **ASB:** Architecture & Security Board. Manages infrastructure and security controls.
* **CRB:** Compliance & Risk Management Board. Manages regulatory compliance and data privacy gates.
* **PII:** Personally Identifiable Information. Data that can be used to identify an individual (e.g., national identifiers, phone numbers).
* **MFA:** Multi-Factor Authentication. Requires multiple independent credentials to verify user identity.

---

## 20. APPENDIX

### 20.1 Emergency Communication Protocol
When critical security incidents or system outages occur, the incident coordinator must alert the response team using the following escalation chain:

```
[ Incident Coordinator ] ──► [ CISO / CTO ] ──► [ Compliance Board ] ──► [ ESC Directors ]
```

* **Immediate Action (0 - 15 Minutes):** Contain the incident, isolate affected systems, and notify the CISO and CTO.
* **Evaluation (15 - 30 Minutes):** Assess system impact, estimate recovery times, and draft the initial incident report.
* **Communication (30 - 60 Minutes):** Notify affected clients and regulators in compliance with data privacy guidelines.

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
