# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
## ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)
### DOCUMENTATION PORTAL & MASTER INDEX (V1.0.0-RELEASE)

---

| System | Enterprise Debt Recovery Operating System (EDROS) |
|---|---|
| **Organization** | Sanjay Dangi Associates |
| **Document ID** | EDROS-GOV-001 |
| **Current Version** | 1.0.0 |
| **Classification** | STRICTLY CONFIDENTIAL - RESTRICTED TO BOARD & LEADERSHIP |
| **Status** | APPROVED / ACTIVE |
| **Owner** | Chief Documentation Officer (CDO) |
| **Reviewer** | Principal Enterprise Architect |
| **Approver** | Chief Technology Officer & steering Committee |
| **Effective Date** | July 15, 2026 |
| **Next Review Date** | January 15, 2027 |

---

## 1. DOCUMENTATION GOVERNANCE POLICY

### 1.1 Purpose
The Documentation Governance Policy defines the mandatory standards, procedures, and responsibilities for creating, maintaining, auditing, and decommissioning documentation for the Enterprise Debt Recovery Operating System (EDROS). This policy guarantees that all documentation remains accurate, secure, compliant, and directly aligned with real-world infrastructure and software states.

### 1.2 Scope
This policy governs all written assets, technical specifications, user manuals, operational runbooks, security profiles, and compliance audits associated with the EDROS ecosystem.

### 1.3 Key Governance Principles
1. **Source of Truth Alignment:** No documentation shall be published without structural validation against the running application code and deployed infrastructure.
2. **Access Control (Least Privilege):** Documentation containing system details, database schemas, cryptographic keys, and credential variables is restricted based on role classification.
3. **Continuous Auditing:** Deployed document repositories are audited bi-annually to identify stale guides, legacy endpoints, or outdated operational procedures.

---

## 2. DOCUMENT CLASSIFICATION POLICY

All EDROS documentation is categorized into four distinct security levels. Every document must carry its classification prominently on the cover sheet and page headers.

```
┌───────────────────────────────────────────────────────────────┐
│                     DOCUMENT SECURITY LEVEL                   │
├───────────────┬───────────────────────────────────────────────┤
│ LEVEL 4       │ STRICTLY CONFIDENTIAL - BOARD / EXEC ONLY     │
├───────────────┼───────────────────────────────────────────────┤
│ LEVEL 3       │ CONFIDENTIAL - INTERNAL IT / DEVOPS ONLY      │
├───────────────┼───────────────────────────────────────────────┤
│ LEVEL 2       │ INTERNAL ONLY - STAFF & OPERATORS             │
├───────────────┼───────────────────────────────────────────────┤
│ LEVEL 1       │ PUBLIC / PARTNER PORTAL                       │
└───────────────┴───────────────────────────────────────────────┘
```

### 2.1 Classification Definitions

#### LEVEL 4: STRICTLY CONFIDENTIAL - EXECUTIVE ONLY
* **Information Type:** Core business strategies, enterprise risk vectors, legal/regulatory liabilities, long-term product roadmaps, and global financial summaries.
* **Access Rules:** Restricted to Board Members, Chief Risk Officer (CRO), Chief Information Officer (CIO), and Chief Executive Officer (CEO).

#### LEVEL 3: CONFIDENTIAL - TECHNICAL STAFF ONLY
* **Information Type:** Physical database schemas, cryptographic keys, network topologies, infrastructure configurations, deployment runbooks, and source code architecture.
* **Access Rules:** Restricted to Principal Architects, Lead Developers, SREs, DBAs, and authorized Security Auditors.

#### LEVEL 2: INTERNAL ONLY - OPERATIONAL STAFF
* **Information Type:** Standard operating procedures, operational manuals (e.g. Branch Manager Manual, Team Leader Manual), non-sensitive business requirements, and generic release notes.
* **Access Rules:** Available to any active authenticated staff member within the Sanjay Dangi Associates intranet.

#### LEVEL 1: PUBLIC / CUSTOMER-FACING
* **Information Type:** General user guides, FAQ libraries, portal brochures, and customer terms of service.
* **Access Rules:** Open to clients, partners, external debtors, and the general public.

---

## 3. VERSIONING POLICY

EDROS documentation adheres strictly to a **Semantic Documentation Versioning (SemDocVer)** model, mirroring the software's semantic versioning:

$$\text{Format: } \mathbf{Major.Minor.Patch}$$

```
    [ Major Update ] . [ Minor Update ] . [ Patch Update ]
           │                  │                  │
           ▼                  ▼                  ▼
      Structural        New Feature/      Grammar / Clarification
       Overhaul          SOP Document        No Feature Changes
```

### 3.1 Version Increment Rules
* **MAJOR Increment (e.g., 1.0.0 -> 2.0.0):** Triggered by a structural overhaul of the platform (e.g., migrating from Next.js to another framework, or a major database schema redesign).
* **MINOR Increment (e.g., 1.0.0 -> 1.1.0):** Triggered by the addition of a new feature, a new operational role manual, or a substantial update to an existing functional process.
* **PATCH Increment (e.g., 1.0.0 -> 1.0.1):** Triggered by minor typographical corrections, clarification of existing guides, or simple formatting improvements.

---

## 4. REVISION POLICY

### 4.1 Triggering Mechanisms
Documents must be revised under the following conditions:
1. **Software Deployment:** A new production release of the EDROS codebase alters UI elements, API contracts, or system limits.
2. **Infrastructure Modification:** Changing hosting providers, DB topologies, or caching strategies (e.g., moving from Upstash to self-hosted Redis).
3. **Audit Recommendations:** Security audits (ISO 27001, SOC 2, RBI audits) identify operational gaps requiring process corrections.
4. **Calendar Expiry:** Document exceeds its maximum review frequency limit (determined by role and classification).

### 4.2 Revision Control
Every document must maintain a complete **Revision Ledger** detailing the author, description of changes, date, and approving authority. Older versions of documentation must be archived in a read-only secure volume.

---

## 5. APPROVAL WORKFLOW

No document may enter the active production library without executing the following multi-stage verification workflow.

```
  ┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
  │ 1. DRAFTING     ├─────►│ 2. REVIEW        ├─────►│ 3. TECHNICAL     │
  │ Subject Matter  │      │ Peer / Principal │      │    VERIFICATION  │
  │ Expert          │      │ Architect        │      │ SRE / Lead Dev   │
  └─────────────────┘      └──────────────────┘      └────────┬─────────┘
                                                              │
                                                              ▼
  ┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
  │ 6. ACTIVE STATUS│◄─────┼ 5. SIGN-OFF      │◄─────┼ 4. SECURITY AUDIT│
  │ Portal          │      │ Executive        │      │ Compliance /     │
  │ Publication     │      │ Approver         │      │ SecOps           │
  └─────────────────┘      └──────────────────┘      └──────────────────┘
```

1. **Phase 1: Drafting:** Written by the primary developer, SRE, or operational lead responsible for the feature.
2. **Phase 2: Architectural Review:** Peer-reviewed by a Principal Architect for structural consistency and technical accuracy.
3. **Phase 3: Technical Verification:** Tested in a sandbox/staging environment by a QA Automation Lead or SRE to confirm procedures are fully functional.
4. **Phase 4: Security Audit:** Reviewed by the Security and Compliance Lead to ensure no sensitive credentials or non-compliant configurations are exposed.
5. **Phase 5: Executive Sign-off:** Formally signed off by the document Owner and designated Approver.
6. **Phase 6: Deployment:** Published to the secure documentation portal with updated master index registry mappings.

---

## 6. DOCUMENT NUMBERING CONVENTION

To ensure instantaneous retrieval and precise cross-referencing, all EDROS documentation must be assigned a unique ID following this schema:

$$\mathbf{EDROS - [CATEGORY] - [SEQUENCE]}$$

### 6.1 Category Code Dictionary
* **`ARCH`**: Architecture & High-Level System Blueprints
* **`DEV`**: Developer, Coding Standards, and IDE Guides
* **`DB`**: Database Schemas, Queries, and Seeding Specs
* **`API`**: REST/WebSocket API Reference Manuals
* **`DEPLOY`**: Deployment, Infrastructure, and CI/CD Runbooks
* **`MON`**: Monitoring, Observability, and Alerting Configurations
* **`DR`**: Disaster Recovery, Backups, and Rollback Strategies
* **`SEC`**: Security, Identity, and RBAC Permission Controls
* **`QA`**: Testing, Test Suites, and Playwright Scenarios
* **`SOP`**: Standard Operating Procedures (IT & Business)
* **`MGR`**: Operations, Administration, and Management Guides
* **`EXEC`**: Front-line Operational & Recovery Field Guides
* **`DEPT`**: Departmental Guides (HR, Finance, Legal)
* **`PORTAL`**: External B2B Client & Customer User Guides

---

## 7. DOCUMENTATION REGISTRY (MASTER LIBRARY MATRIX)

This section maps out the target index of all **52 comprehensive enterprise documents** comprising the complete EDROS Documentation Portal.

```
                      ┌─────────────────────────────────┐
                      │    EDROS DOCUMENTATION PORTAL   │
                      └────────────────┬────────────────┘
      ┌────────────────────────────────┼────────────────────────────────┐
      ▼                                ▼                                ▼
[ BUSINESS & ADMIN ]          [ TECHNICAL SPEC ]              [ USER MANUALS ]
  ├── Executive Handbook        ├── Core Architecture           ├── Super Admin Manual
  ├── Business Requirements     ├── DB / Schema Guide           ├── Executive Field Manual
  └── Standard Procedures       └── S3 / Vault Config           └── Portal Client Guides
```

### 7.1 Architecture, Infrastructure & DevOps (10 Documents)

| Doc ID | Document Title | Priority | Dependencies | Owner | Approver | Frequency | Page Count (Est) | Target Audience |
|---|---|---|---|---|---|---|---|---|
| **EDROS-ARCH-001** | Executive Product Handbook | High | None | CDO | VP Operations | Annual | 25-30 | Board, Execs |
| **EDROS-ARCH-002** | Enterprise System Architecture | Critical | None | Principal Architect | CTO | Annual | 45-50 | Tech Leads, SREs |
| **EDROS-ARCH-003** | Database Architecture & ERD Spec | Critical | EDROS-ARCH-002 | Principal DBA | CTO | Bi-Annual | 35-40 | DBAs, Developers |
| **EDROS-ARCH-004** | Cloudflare R2 S3 Object Storage Spec | High | EDROS-ARCH-002 | Infrastructure Lead | Head of Security | Annual | 20-25 | DevOps, SREs |
| **EDROS-DEPLOY-001** | Infrastructure Deployment Runbook | Critical | EDROS-ARCH-002 | DevOps Lead | VP Infrastructure | Bi-Annual | 40-45 | DevOps, SREs |
| **EDROS-DEPLOY-002** | Vercel Frontend Deployment Guide | High | EDROS-DEPLOY-001 | Frontend Architect | DevOps Lead | Annual | 15-20 | Frontend Devs |
| **EDROS-DEPLOY-003** | Railway Worker & BullMQ Engine Guide | Critical | EDROS-DEPLOY-001 | Backend Architect | SRE Lead | Bi-Annual | 30-35 | Backend Devs, SREs |
| **EDROS-DEPLOY-004** | Neon Serverless PostgreSQL Spec | High | EDROS-ARCH-003 | Principal DBA | SRE Lead | Annual | 25-30 | DBAs, DevOps |
| **EDROS-DEPLOY-005** | Upstash Serverless Redis & Cache Guide | Medium | EDROS-DEPLOY-001 | Backend Architect | DevOps Lead | Annual | 15-20 | Backend Devs |
| **EDROS-DEPLOY-006** | Cloudflare DNS, CDN & WAF Config | High | EDROS-DEPLOY-001 | Security Lead | CISO | Annual | 20-25 | SecOps, NOC |

---

### 7.2 Development, Testing & API (10 Documents)

| Doc ID | Document Title | Priority | Dependencies | Owner | Approver | Frequency | Page Count (Est) | Target Audience |
|---|---|---|---|---|---|---|---|---|
| **EDROS-DEV-001** | Developer Environment Installation Guide | High | None | Lead Developer | Principal Architect | Annual | 20-25 | New Developers |
| **EDROS-DEV-002** | Core Coding & Formatting Standards | Medium | None | Lead Developer | Principal Architect | Annual | 15-20 | Software Engineers |
| **EDROS-DEV-003** | Enterprise Directory & Modular Folder Spec | Medium | None | Lead Developer | Principal Architect | Annual | 10-12 | Software Engineers |
| **EDROS-DEV-004** | Environment Variables & KMS Registry | Critical | EDROS-DEPLOY-001 | SecOps Lead | CISO | Bi-Annual | 25-30 | DevOps, Tech Leads |
| **EDROS-API-001** | Complete Developer REST API Reference | Critical | EDROS-ARCH-002 | Backend Architect | Principal Architect | Bi-Annual | 65-70 | Integration Partners |
| **EDROS-SEC-001** | RBAC Matrix & Access Control Framework | Critical | EDROS-ARCH-002 | Security Lead | CISO | Bi-Annual | 35-40 | Compliance Officers |
| **EDROS-QA-001** | Quality Assurance & Testing Framework | High | None | QA Lead | VP Engineering | Annual | 25-30 | QA Engineers |
| **EDROS-QA-002** | Playwright E2E Test Suite Runbook | High | EDROS-QA-001 | QA Automation Lead | QA Lead | Bi-Annual | 30-35 | Automation QA, SREs |
| **EDROS-DEPLOY-007** | GitHub Actions CI/CD Pipeline Manual | High | EDROS-DEPLOY-001 | DevOps Lead | SRE Lead | Annual | 25-30 | DevOps, Developers |
| **EDROS-DEPLOY-008** | Production Docker Containerization Spec | High | EDROS-DEPLOY-001 | SRE Lead | VP Infrastructure | Annual | 20-25 | DevOps, SREs |

---

### 7.3 Operations, SRE & Disaster Recovery (10 Documents)

| Doc ID | Document Title | Priority | Dependencies | Owner | Approver | Frequency | Page Count (Est) | Target Audience |
|---|---|---|---|---|---|---|---|---|
| **EDROS-MON-001** | OpenTelemetry, Prometheus & Grafana Guide | Critical | EDROS-DEPLOY-001 | SRE Lead | VP Infrastructure | Bi-Annual | 35-40 | SREs, NOC Engineers |
| **EDROS-MON-002** | Enterprise Logging & Pino Stream Config | High | EDROS-MON-001 | Backend Architect | SRE Lead | Annual | 15-20 | Developers, SREs |
| **EDROS-MON-003** | Sentry Exception Tracking & Alert Rules | High | None | Frontend Architect | QA Lead | Annual | 15-20 | Developers, QA |
| **EDROS-DR-001** | Disaster Recovery (DR) & Failover Playbook | Critical | EDROS-DEPLOY-001 | SRE Lead | CTO | Annual | 40-45 | SREs, Tech Leadership |
| **EDROS-DR-002** | Neon Database Backup & Point-in-Time Restore | Critical | EDROS-DEPLOY-004 | Principal DBA | VP Infrastructure | Bi-Annual | 25-30 | DBAs, SREs |
| **EDROS-DR-003** | Automated Pipeline Rollback Guide | High | EDROS-DEPLOY-007 | DevOps Lead | SRE Lead | Annual | 20-25 | DevOps, SREs |
| **EDROS-SEC-002** | Security Compliance & Penetration Audit Guide | High | None | Security Lead | CISO | Annual | 45-50 | Auditors, SecOps |
| **EDROS-SEC-003** | Incident Response & Cyber Breach Playbook | Critical | None | SecOps Lead | CISO | Annual | 35-40 | Incident Responders |
| **EDROS-SOP-001** | Standard IT Operating Procedures (IT-SOP) | High | None | IT Support Lead | VP Operations | Annual | 30-35 | L1/L2/L3 Helpdesk |
| **EDROS-SOP-002** | Help Desk Ticketing & System Escalation | Medium | EDROS-SOP-001 | IT Support Lead | IT Director | Annual | 15-20 | Helpdesk Staff |

---

### 7.4 Management & Field Operations Manuals (11 Documents)

| Doc ID | Document Title | Priority | Dependencies | Owner | Approver | Frequency | Page Count (Est) | Target Audience |
|---|---|---|---|---|---|---|---|---|
| **EDROS-MGR-001** | Super Administrator Platform Manual | Critical | EDROS-SEC-001 | IT Director | CTO | Annual | 40-45 | System Admins |
| **EDROS-MGR-002** | National Operations Head Control Manual | High | EDROS-ARCH-001 | National Head | VP Operations | Annual | 30-35 | C-Suite, Country Heads |
| **EDROS-MGR-003** | State Operations Manager Control Manual | High | EDROS-MGR-002 | State Manager | National Head | Annual | 25-30 | State Leads |
| **EDROS-MGR-004** | Regional Operations Manager Manual | High | EDROS-MGR-003 | Regional Manager | State Manager | Annual | 25-30 | Regional Leads |
| **EDROS-MGR-005** | Branch Manager Operational Manual | High | None | Branch Manager | Regional Manager | Annual | 30-35 | Branch Heads |
| **EDROS-MGR-006** | Team Leader Case Allocation Manual | High | None | Team Leader | Branch Manager | Annual | 25-30 | Team Leads |
| **EDROS-EXEC-001** | Recovery Executive Mobile Interface Manual | Critical | None | Field Operations Lead | VP Operations | Bi-Annual | 35-40 | Field Recovery Agents |
| **EDROS-DEPT-001** | HR Staff Roster & Performance Tracking | Medium | None | HR Director | VP Operations | Annual | 20-25 | HR Specialists |
| **EDROS-DEPT-002** | Finance Settlement Sandbox & Payout Manual | High | EDROS-ARCH-003 | Finance Lead | CFO | Annual | 30-35 | Accounts Teams |
| **EDROS-DEPT-003** | Legal Litigation, Notices & Case Docket Manual | High | EDROS-ARCH-003 | Legal Counsel | Chief Legal Officer | Annual | 40-45 | Legal Operations |
| **EDROS-SOP-003** | Production Go-Live Deployment Checklist | Critical | EDROS-DEPLOY-001 | Release Manager | CTO | Bi-Annual | 15-20 | Deploy Team, DevOps |

---

### 7.5 External Integrations & Client Portals (11 Documents)

| Doc ID | Document Title | Priority | Dependencies | Owner | Approver | Frequency | Page Count (Est) | Target Audience |
|---|---|---|---|---|---|---|---|---|
| **EDROS-PORTAL-001** | Bank Creditor Client Portal Integration Guide | High | EDROS-API-001 | Client Success Lead | VP Operations | Annual | 25-30 | Partner Banks |
| **EDROS-PORTAL-002** | External Debtor Settlement Portal Guide | High | None | UX Director | VP Operations | Annual | 20-25 | Borrowers / Debtors |
| **EDROS-SOP-004** | Post Go-Live Stabilization & Audit Manual | High | EDROS-SOP-003 | Release Manager | Tech Director | Annual | 15-20 | Deploy Team, SREs |
| **EDROS-TRAIN-001** | Corporate Training Program & Onboarding | Medium | None | Training Lead | HR Director | Annual | 30-35 | Trainers, New Hires |
| **EDROS-SOP-005** | System Maintenance & Patching Guide | High | EDROS-DEPLOY-001 | SRE Lead | VP Infrastructure | Annual | 20-25 | SREs, DBAs |
| **EDROS-COMP-001** | DPDP Compliance & Privacy Protection | Critical | EDROS-SEC-001 | Compliance Officer | Chief Legal Officer | Annual | 35-40 | Auditors, Legal |
| **EDROS-COMP-002** | RBI Banking Regulations Alignment Guide | Critical | EDROS-SEC-001 | Compliance Officer | Board of Directors | Annual | 45-50 | Auditors, Execs |
| **EDROS-AI-001** | AI Strategy & Recovery Optimization Roadmap | Medium | None | Principal AI Research | CTO | Annual | 30-35 | Execs, Tech Teams |
| **EDROS-COMP-003** | ISO 27001 Security Controls Audit Sheet | High | EDROS-SEC-002 | Security Lead | CISO | Annual | 40-45 | Security Auditors |
| **EDROS-COMP-004** | SOC 2 Type II System Audit Readiness Guide | High | EDROS-SEC-002 | Security Lead | CISO | Annual | 35-40 | Security Auditors |
| **EDROS-SOP-006** | System Decommissioning & Data Purging Spec | Low | EDROS-ARCH-003 | Compliance Officer | CTO & CFO | Annual | 15-20 | SREs, DBAs, Legal |

---

## 8. DOCUMENT CATEGORIES SUMMARY DEFINITIONS

### 8.1 Business & Strategy (`ARCH` / `MGR`)
Defines long-term ROI indicators, macroeconomic targets, and organizational structures mapped to the deployment of EDROS.

### 8.2 Technical Specification & Database (`ARCH` / `DB` / `API` / `SEC`)
Highly detailed technical manuals detailing PostgreSQL relational architectures, REST contracts, and data-flow pipelines.

### 8.3 Infrastructure, Deployment & DevOps (`DEPLOY` / `DR`)
Runbooks for orchestrating cloud providers, Docker configurations, Redis nodes, Cloudflare parameters, and automated deployment pipelines.

### 8.4 SRE, Observability & Security (`MON` / `SEC`)
Manuals covering trace configurations, custom Grafana metric charts, exception handling rules, emergency failover, and access control profiles.

### 8.5 Operational & User Manuals (`MGR` / `EXEC` / `DEPT` / `PORTAL`)
Step-by-step UI references, navigation workflows, and process guidelines for users ranging from Super Administrators and corporate departments to field agents.

---

## 9. DOCUMENT DEPENDENCY TOPOLOGY

To ensure logical sequence integrity during updates, the documentation tree defines specific prerequisite paths:

```
                  ┌──────────────────────┐
                  │    EDROS-ARCH-002    │ (Enterprise System Architecture)
                  └──────────┬───────────┘
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   ┌─────────────────┐               ┌─────────────────┐
   │ EDROS-DEPLOY-001│               │ EDROS-ARCH-003  │ (DB Architecture)
   │ (Infrastructure)│               └────────┬────────┘
   └────────┬────────┘                        │
            ▼                                 ▼
   ┌─────────────────┐               ┌─────────────────┐
   │ EDROS-DEPLOY-003│               │ EDROS-API-001   │ (API Reference)
   │ (Worker Services│               └─────────────────┘
   └─────────────────┘
```

* **Core Root:** `EDROS-ARCH-002` (Enterprise System Architecture) is the ultimate root dependency. Any changes to this document require review across all technical sheets.
* **Database Branch:** `EDROS-ARCH-003` (Database Architecture) must be updated and signed off prior to modifying `EDROS-API-001` (Complete REST API Reference).
* **Infrastructure Branch:** `EDROS-DEPLOY-001` (Infrastructure Deployment Runbook) is a prerequisite for all host-specific guides (`EDROS-DEPLOY-002`, `EDROS-DEPLOY-003`, `EDROS-DEPLOY-004`).

---

## 10. REVISION HISTORY (MASTER INDEX)

| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | CDO | Initial publication of the Documentation Master Index. | CTO & Steering Committee |

---

## 11. REVISION REVIEW SCHEDULE & MAINTENANCE
To prevent documentation decay, documents are reviewed regularly based on their priority level:
* **Critical Priority Docs:** Evaluated every 180 calendar days.
* **High Priority Docs:** Evaluated every 365 calendar days.
* **Medium & Low Priority Docs:** Evaluated bi-annually or upon system upgrades.

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
