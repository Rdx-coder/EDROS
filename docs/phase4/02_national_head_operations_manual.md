# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-OPS-NHM-002
## VERSION: 1.0.0
## CLASSIFICATION: INTERNAL ONLY (LEVEL 2 - OPERATIONAL STAFF)

---

# DOCUMENT 2: NATIONAL HEAD OPERATIONS MANUAL

```
================================================================================
               N A T I O N A L   H E A D   O P E R A T I O N S
                                 M A N U A L
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Chief Operations Officer (COO)
Reviewer:     Chief Compliance Officer (CCO)
Approver:     Chief Executive Officer (CEO) & Operations Control Board
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline issue of the National Head Operations Manual for EDROS v1.0.0. | Chief Operations Officer | CEO & Operations Control Board |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES](#2-applicable-standards--compliance-boundaries)
3. [DEFINITIONS](#3-definitions)
4. [SYSTEM OVERVIEW & NATIONAL HEAD PORTAL](#4-system-overview--national-head-portal)
5. [NAVIGATION & OPERATION FLOW](#5-navigation--operation-flow)
6. [STATE MONITORING & GEOGRAPHIC HEATMAPS](#6-state-monitoring--geographic-heatmaps)
7. [PERFORMANCE DASHBOARD & STRATEGIC BI](#7-performance-dashboard--strategic-bi)
8. [REVENUE REPORTING & COLLECTION FORECASTS](#8-revenue-reporting--collection-forecasts)
9. [RECOVERY PERFORMANCE ANALYSIS](#9-recovery-performance-analysis)
10. [EXCEPTIONAL SETTLEMENT APPROVALS SOP](#10-exceptional-settlement-approvals-sop)
11. [NATIONAL ESCALATION & DISPUTE ARBITRATION](#11-national-escalation--dispute-arbitration)
12. [OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)](#12-operational-key-performance-indicators-kpis)
13. [GOVERNANCE CONTROLS & MONITORING SEALS](#13-governance-controls--monitoring-seals)
14. [DAILY, WEEKLY, AND MONTHLY SOP CHECKLISTS](#14-daily-weekly-and-monthly-sop-checklists)
15. [BEST PRACTICES & MACRO ADVOCACY](#15-best-practices--macro-advocacy)
16. [COMMON MISTAKES & MANAGEMENT PITFALLS](#16-common-mistakes--management-pitfalls)
17. [TROUBLESHOOTING & SYSTEM ESCALATIONS](#17-troubleshooting--system-escalations)
18. [VALIDATION CHECKLIST & SYSTEM SMOKE TESTING](#18-validation-checklist--system-smoke-testing)
19. [FAQ SECTION](#19-faq-section)
20. [GLOSSARY & REFERENCES](#20-glossary--references)
21. [APPENDIX](#21-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This operations manual establishes the definitive procedural framework and standard operating guidelines for the National Head of Recovery Operations within the Enterprise Debt Recovery Operating System (EDROS). This document outlines step-by-step instructions for national portfolio monitoring, strategic business intelligence (BI) consumption, macroeconomic risk mitigation, multi-state coordination, and the arbitration of high-exposure settlement escalations.

### 1.2 Scope
This manual governs all administrative and analytical functions exposed within the `National Head Portal` of EDROS, including:
* **State-Level Performance Auditing:** Monitoring state indicators, regional collection margins, and branch resource allocations.
* **Exceptional Financial Approvals:** Validating settlement write-offs and debt haircuts exceeding 30.00% to 50.00% thresholds.
* **National Business Intelligence:** Utilizing interactive reports, yield analytics, revenue forecasts, and collection efficiency tables.
* **Strategic Risk Oversight:** Assessing nationwide compliance metrics against Fair Practices Code (FPC) rules and regional collection guidelines.

### 1.3 Target Audience
This operations manual is written for:
* **The National Head of Recovery Operations** and Regional Directors overseeing the master performance curves of EDROS.
* **C-Suite Officers (COO, CCO, CEO)** monitoring nationwide recovery efficiency, brand reputation parameters, and corporate cash flows.
* **State and Regional Managers** seeking to align local operational activities with national strategic targets.
* **Partner Bank Executive Contacts** evaluating organizational recovery standards and audit histories.

---

## 2. APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES

The National Head Portal operates within a highly regulated financial environment. All operational strategies must align with:

```
┌─────────────────────────────────────────────────────────────┐
│                 COMPLIANCE CONTROL RING                     │
├───────────────┬─────────────────────────────────────────────┤
│ RBI FPC       │ Fair Practices Code for Lenders             │
├───────────────┼─────────────────────────────────────────────┤
│ DPDP Act      │ Digital Personal Data Protection Act (2023) │
├───────────────┼─────────────────────────────────────────────┤
│ ISO 9001      │ Quality Management Standards                │
├───────────────┼─────────────────────────────────────────────┤
│ SOC 2         │ Security, Integrity, & Privacy Principles   │
└───────────────┴─────────────────────────────────────────────┘
```

> **CRITICAL COMPLIANCE REMINDER:** The National Head must ensure all operational outreach procedures are reviewed against the latest applicable regional laws, DPDP Act consent regulations, and Reserve Bank of India (RBI) guidelines before launching nationwide collection campaigns.

---

## 3. DEFINITIONS

* **Principal-Interest Yield (PIY):** The ratio tracking recovered principal balances against recovered interest penalties, illustrating true recovery yield.
* **Exceptional Haircut:** Any proposed debt settlement that write off more than 30.00% of a borrower's total outstanding balance.
* **SLA Drift:** The measure of time delay between a local escalation trigger (such as a disputed case or unresolved geofence warning) and its final operational resolution.
* **Consent Hierarchy:** The structured system within EDROS that matches borrower data processing activities with verified, user-granted consent logs.
* **Sovereign Portfolio Isolation:** The cryptographic separation of banking portfolios, ensuring no data leaks or cross-tenant exposure can occur between client banks.

---

## 4. SYSTEM OVERVIEW & NATIONAL HEAD PORTAL

The National Head Portal provides a high-level command dashboard for Sanjay Dangi Associates' nationwide debt recovery operations. Operating as an analytical overlay, the portal aggregates data from state nodes, regional branch registries, and active field executive check-ins to deliver a real-time view of platform operations.

### 4.1 System Integration & Data Streams
The portal pulls real-time data from core system components:
* **Neon PostgreSQL Master Instance:** Aggregates transactional data, settlement logs, and employee registers across all states.
* **Upstash Redis Cluster:** Tracks active mobile user counts, geofencing statuses, and background task speeds.
* **Cloudflare R2 Storage Vault:** Houses watermarked legal notices, signed settlement receipts, and audit trail outputs.

---

## 5. NAVIGATION & OPERATION FLOW

The National Head Portal features a clean, tabbed navigation console designed to keep critical indicators and strategic workspaces quickly accessible:

```
[ National Head Portal ]
          │
          ├──► [ Geographic Command Desk ] (Interactive Map, State Heatmaps, Regional Nodes)
          │
          ├──► [ BI Performance Analytics ] (Principal/Interest Yield, Conversion Ratios, Trends)
          │
          ├──► [ Approvals Workspace ] (High-Exposure Haircuts, Exception Settlement Audits)
          │
          └──► [ Escalation & Dispute Center ] (SLA Drift Tracker, Multi-State Arbitration Desk)
```

---

## 6. STATE MONITORING & GEOGRAPHIC HEATMAPS

The primary interface of the Geographic Command Desk provides an interactive view of performance across all active state networks.

### 6.1 Interactive State Heatmap User Interface
* **The Geo-Heatmap Panel:** An interactive map of India displaying color-coded states based on their active recovery ratings:
  - **Green (Optimal):** Recovery conversion rate `> 85.00%`.
  - **Amber (At-Risk):** Recovery conversion rate between `65.00%` and `84.99%`.
  - **Red (Critical):** Recovery conversion rate `< 65.00%` or high volumes of unresolved compliance escalations.
* **Drill-Down Capabilities:** Clicking on a state (e.g., *Maharashtra*) zooms the view to reveal regional physical branch offices, staffing levels, active caseload volumes, and local supervisor details.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Geographic Command Desk Panel                 |
| Capture the complete Geographic Command interface, focusing on the state    |
| heatmaps, the regional active caseload lists, and hover-state metrics.     |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 7. PERFORMANCE DASHBOARD & STRATEGIC BI

The Performance Dashboard translates raw collection transactions into high-level business intelligence metrics to guide strategic planning:

```
+─────────────────────────────────────────────────────────────────────────────+
| NATIONAL HEAD HIGH-LEVEL PERFORMANCE METRICS                                |
|                                                                             |
| Active Collections: [ INR 45,281,900 ] - Month-to-Date Volume              |
| Conversion Rate:    [ 82.45% ]         - Target Conversion: 85.00%          |
| Active Field Force: [ 1,420 Agents ]   - Ingress Sync Rate: 99.8%           |
| Active Escalations: [ 12 Open Cases ]  - Average Response: 14 Mins          |
+─────────────────────────────────────────────────────────────────────────────+
```

### 7.1 Key Business Intelligence Charts
* **Principal vs. Interest Recovery Chart:** A stacked bar chart showing the split between recovered principal balances and interest penalties across major portfolios.
* **State Performance Comparison:** A grouped column chart comparing collection targets against actual recoveries for each active state.
* **Field Efficiency Scatter Plot:** A scatter plot mapping branch headcounts against recovery volumes, helping administrators optimize staffing levels.

---

## 8. REVENUE REPORTING & COLLECTION FORECASTS

The National Head compiles monthly performance reports and recovery forecasts to share with corporate executives and client banking teams.

### 8.1 Generating National Revenue Reports
1. Navigate to **BI Performance Analytics** -> **Reports Console** -> **National Revenue**.
2. Select the parent portfolio: e.g., `State Bank of India`.
3. Choose the reporting period and group the data by State.
4. Click **Compile Revenue Report**. The system aggregates the transactional data and generates performance visualizers.
5. Click **Publish and Save**. The report is packaged as a watermarked PDF, saved to the secure R2 store, and shared with authorized banking stakeholders.

---

## 9. RECOVERY PERFORMANCE ANALYSIS

To optimize recovery rates, the National Head regularly audits collection performance indicators across distinct categories:

### 9.1 Recovery Performance Variables by State

| State Network | Active Caseload | Month-to-Date Recovery | Conversion Rate | Compliance Audit Rating | Staffing Levels |
| :--- | :---: | :--- | :---: | :---: | :---: |
| **Maharashtra** | 12,450 Cases | INR 14,250,000 | 87.42% | 100.00% (Passed) | 420 Agents |
| **Gujarat** | 9,820 Cases | INR 11,100,000 | 83.15% | 100.00% (Passed) | 310 Agents |
| **Karnataka** | 8,540 Cases | INR 9,250,000 | 79.84% | 99.85% (Passed) | 280 Agents |
| **Tamil Nadu** | 11,200 Cases | INR 10,681,900 | 74.20% | 98.42% (Warning) | 410 Agents |

---

## 10. EXCEPTIONAL SETTLEMENT APPROVALS SOP

To protect margins, debt write-offs and haircuts are restricted by strict validation thresholds. Settlement proposals exceeding standard limits are automatically escalated to the National Head.

```
┌─────────────────────────────────────────────────────────────┐
│                 EXCEPTIONAL APPROVAL ROUTE                  │
├───────────────┬─────────────────────────────────────────────┤
│ STEP 1        │ Supervisor proposes haircut (> 30.00% - 50%)│
├───────────────┼─────────────────────────────────────────────┤
│ STEP 2        │ Proposal locks, triggering National alert   │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 3        │ Head reviews case history and reason code   │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 4        │ Head authorizes with secure OTP signature   │
└───────────────┴─────────────────────────────────────────────┘
```

### 10.1 Processing Exceptional Settlement Proposals
1. Navigate to the **Approvals Workspace** -> **Pending Exceptions**.
2. Select an escalated case: e.g., `CASE-SBI-MUM-90210`.
3. Review the case details, payment history, collector notes, and proposed haircut level (e.g., *42.5%*).
4. If the proposal is approved, click **Approve Settlement**.
5. The system prompts for a secure, multi-factor authorization code.
6. Enter the OTP from your authenticator app to sign the transaction.
7. The system registers the approval, updates the case status, and saves a cryptographically signed receipt to the R2 store.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Exceptional Approvals Workspace              |
| Capture the approval form UI, highlighting the proposed haircut percentage, |
| the step-by-step audit history, and the multi-factor validation modal.      |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 11. NATIONAL ESCALATION & DISPUTE ARBITRATION

When local disputes or operational issues cannot be resolved at the state level, they are escalated to the National Escalation & Dispute Center for arbitration.

### 11.1 Standard Dispute Resolution Pathways
* **Compliance Infracs (e.g., Out-of-Hours Outreach):** The system flags the infraction, locks associated user accounts, and alerts compliance auditors. The National Head reviews the incident and logs corrective actions.
* **SLA Resolution Drifts:** Monitors unresolved regional escalations. If an escalation remains open beyond SLA limits, the system triggers a warning alert to the National Head.
* **Geofence Override Disputes:** Resolves disputes where agents are unable to check in due to natural GPS drift or physical access limitations.

---

## 12. OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)

National operations are tracked against key performance indicators (KPIs) to monitor compliance and recovery metrics.

```
+─────────────────────────────────────────────────────────────────────────────+
| NATIONAL OPERATIONAL PERFORMANCE TARGETS                                    |
|                                                                             |
| National Recovery Yield: [ Target: > 85.00% ]                               |
| Outreach Compliance:     [ Target: 100.00% Correct ]                        |
| SLA Escalation Resolution:[ Target: < 2 Hours ]                             |
| System Latency Baseline: [ Target: < 150ms ]                                |
+─────────────────────────────────────────────────────────────────────────────+
```

* **National Recovery Yield:** Maintain a nationwide recovery conversion rate of `> 85.00%`.
* **Outreach Compliance:** Zero contact attempts may occur outside of RBI-permitted hours.
* **SLA Escalation Resolution:** Resolved escalated cases within 2 hours of logging.

---

## 13. GOVERNANCE CONTROLS & MONITORING SEALS

Compliance and security standards are enforced through automated controls built directly into the platform:

* **Sovereign Database Isolation:** Tenant banking data is isolated at the schema level, ensuring absolute privacy.
* **Operational Time Gates:** The system automatically locks out outreach APIs outside of permitted contact hours (08:00 to 19:00).
* **Closed-Loop Geofencing:** Field check-ins check coordinates against branch geofences, logging coordinate mismatch alerts to the audit trail.

---

## 14. DAILY, WEEKLY, AND MONTHLY SOP CHECKLISTS

The National Head must complete these checklists to verify operational performance and compliance:

### 14.1 Daily Checklist (Performance & Outages)
* [ ] **Dashboard Check:** Review the National Head dashboard, checking state recovery targets and active caseloads.
* [ ] **Escalation Review:** Audit open escalations, checking SLA response times and unresolved disputes.
* [ ] **Compliance Scan:** Confirm that zero contact attempts occurred outside of RBI-permitted hours.

### 14.2 Weekly Checklist (Audits & Staffing)
* [ ] **Branch Resource Audit:** Review branch staffing levels and caseload distributions, adjusting allocations where needed.
* [ ] **Exceptional Approvals Review:** Audit approved settlement write-offs, verifying that all exceptions have matching justification logs.
* [ ] **Audit Trail Scan:** Verify that all state-modifying actions have corresponding cryptographically sealed audit records.

### 14.3 Monthly Checklist (Reporting & Strategy)
* [ ] **BI Yield Analysis:** Review monthly principal vs. interest recovery yields and state performance charts.
* [ ] **Executive Reporting:** Compile and share the Monthly Debt Recovery Summary report with C-suite stakeholders.
* [ ] **Target Adjustments:** Update state collection quotas and regional targets for the upcoming calendar month.

---

## 15. BEST PRACTICES & MACRO ADVOCACY

* **Implement Least Privilege:** Ensure users are assigned only the minimum roles necessary to complete their daily tasks.
* **Review SLA Drift Weekly:** Regularly check SLA resolution drifts to identify bottlenecks in regional escalations.
* **Audit Consent Records:** Periodically verify that data consent logs are active and comply with DPDP guidelines.

---

## 16. COMMON MISTAKES & MANAGEMENT PITFALLS

* **Ignoring SLA Response Drifts:** Failing to monitor regional escalations can delay resolution times and risk compliance infractions.
  * *Correction:* Monitor SLA metrics daily, and escalate unresolved disputes to regional managers.
* **Approving Settlements Without Documentation:** Approving debt haircuts without clear supervisor notes or payment histories can lead to audit warnings.
  * *Correction:* Always require a justification log for exceptional settlement proposals.
* **Deploying Non-Standard Configurations:** Implementing manual, non-standard workflow parameters at the state level can cause operational inconsistencies.
  * *Correction:* Standardize all platform settings and workflows across all state registries.

---

## 17. TROUBLESHOOTING & SYSTEM ESCALATIONS

### 17.1 Real-Time Revenue Data Outages
* **Symptom:** Performance charts display blank or zero values for active states.
* **Diagnostic Steps:** Check the database connection status and verify pgBouncer logs.
* **Resolution:** Ensure the connection string is valid and that database connection pools are not exhausted.

### 17.2 Mobile Agent Check-in Sync Delays
* **Symptom:** Regional managers report delayed check-in logs and map telemetry updates from field executives.
* **Diagnostic Steps:** Check Upstash Redis active queues and monitor worker container logs.
* **Resolution:** Scale Railway worker containers horizontally to handle sudden check-in volume spikes.

---

## 18. VALIDATION CHECKLIST & SYSTEM SMOKE TESTING

Before promoting configuration updates or target adjustments to the production environment, verify system stability against this checklist:

* [ ] **Database Connection:** Verify that the platform connects to production database pools using pgBouncer endpoints.
* [ ] **Queue Integrity:** Confirm that background task queues are online and accepting BullMQ assignments.
* [ ] **Access Controls:** Verify that user roles match the approved RBAC matrix and that no administrative secrets are exposed in client logs.
* [ ] **WAF Security Active:** Confirm that Cloudflare Web Application Firewall (WAF) rules are active and blocking unauthorized requests.

---

## 19. FAQ SECTION

#### Q1: Can the National Head override an exceptional settlement proposal that was rejected by a regional manager?
Yes. The National Head has master approval authority over all settlement proposals. However, overrides must include a detailed justification log, which is permanently saved to the immutable audit trail.

#### Q2: What happens if a state network falls below its recovery target for two consecutive months?
The system flags the state network as `Critical` (Red) on the geo-heatmap. The National Head receives an automated alert and must coordinate with the state manager to implement a Corrective and Preventive Action (CAPA) plan.

#### Q3: How are borrower consent revocations handled in the National Head Portal?
When a borrower revokes data processing consent, the system automatically logs the revocation, flags the associated case, masks all borrower PII, and pauses active outreach tasks.

---

## 20. GLOSSARY & REFERENCES

### 20.1 Glossary of Terms
* **PIY:** Principal-Interest Yield. The ratio tracking recovered principal balances against recovered interest penalties.
* **SLA:** Service Level Agreement. Predefined targets for response and resolution times.
* **WAF:** Web Application Firewall. Filters, monitors, and blocks malicious HTTP traffic to protect web applications.
* **MFA:** Multi-Factor Authentication. Requires multiple independent credentials to verify user identity.
* **CAPA:** Corrective and Preventive Action. A structured process used to resolve and prevent the recurrence of non-conformities.

### 20.2 Regulatory & System References
1. **Reserve Bank of India (RBI):** Directions on Fair Practices Code and Debt Collection Standards.
2. **Digital Personal Data Protection Act, 2023:** Act No. 26 of 2023, Government of India.
3. **ISO 9001:2015:** Quality Management Systems Requirements.
4. **Cloudflare WAF Documentation:** Official guide for configuring edge web application firewalls and DDoS protection rules.

---

## 21. APPENDIX

### 21.1 Escalation Record Log Template
When regional disputes are escalated to the National Head, the coordinator must log the details using the following structured template:

```
ESCALATION RECORD LOG:
Escalation ID:  ESC-EDROS-2026-0084
Date Logged:    2026-07-15 03:00:00 UTC
State Node:     Maharashtra State Network
Branch Office:  Mumbai Central Branch (BR-MUM-001)
Dispute Type:   SLA Response Drift Warning
Description:    Unresolved geofence check-in dispute open beyond 4-hour limit.
Arbitration:    Reviewed supervisor logs and authorized a manual check-in override.
Audit Status:   RESOLVED & CLOSED (Logged to audit ledger)
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
