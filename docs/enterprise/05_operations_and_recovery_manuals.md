# EDROS ENTERPRISE DOCUMENTATION LIBRARY
## MODULE 05: TROUBLESHOOTING, DISASTER RECOVERY, OBSERVABILITY, SECURITY, AND QA HANDBOOK

---

## DOCUMENT 21: TROUBLESHOOTING GUIDE

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-TSG-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / TECHNICAL SUPPORT DIVISION
* **Author:** Global Support Operations Lead
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Support Ops Lead | Standard troubleshooting matrix. | Director of Technical Services |

---

### 21.1 PURPOSE
This guide provides Level 1 through Level 3 technical support teams with step-by-step diagnostic and remediation protocols to resolve system exceptions, infrastructure faults, and application error states.

### 21.2 INTENDED AUDIENCE
* **Technical Support Engineers (L1/L2/L3)**
* **Database Administrators (DBAs)**
* **Network Operations Center (NOC) Analysts**

### 21.3 SYSTEM ERROR RESOLUTION MATRIX

#### Fault A: `DATABASE_CONNECTION_LOSS`
* **Symptom:** API routes return `503 Service Unavailable` with logs indicating timeouts in Drizzle pooled connections.
* **Diagnostics:** Run database ping checks inside the Architecture Hub console or execute terminal checkups.
* **Remediation:** Verify Cloud SQL VPC connection routes. Check if active connections exceed high-water limits; restart container replicas if pooling gets stuck.

#### Fault B: `GPS_GEOFENCE_REJECT`
* **Symptom:** Recovery agents receive a permission error or `GEOFENCE_BOUNDS_MISMATCH` when attempting to clock in.
* **Diagnostics:** Check the agent's browser location coordinates.
* **Remediation:** Verify that the agent's device has GPS location services enabled and that browser permissions allow access. Ensure their physical coordinates fall within the geofenced radius of their assigned branch office.

---

## DOCUMENT 22: DISASTER RECOVERY GUIDE

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-DRG-2026-V1
* **Version:** 1.0.0
* **Classification:** STRICTLY CONFIDENTIAL / EMERGENCY PROTOCOLS
* **Author:** Business Continuity Director
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | BC Director | Disaster recovery setup & failover routes. | Chief Operations Officer |

---

### 22.1 PURPOSE
This guide defines business continuity requirements, data backup schedules, and failover steps to ensure EDROS services remain available during a datacenter outage.

### 22.2 INTENDED AUDIENCE
* **SREs & System Engineers**
* **Risk & Recovery Directors**
* **Infrastructure Operations Managers**

### 22.3 SYSTEM RECOVERY TARGETS
To protect critical banking operations, EDROS commits to strict Recovery Point and Recovery Time Objectives (RPOs/RTOs):

| Parameter | Recovery Target (SLA) | Metrics |
|---|---|---|
| **RPO (Recovery Point Objective)** | < 15 Minutes | Maximum allowable data loss under active transaction states. |
| **RTO (Recovery Time Objective)** | < 30 Minutes | Maximum time to fully restore operational capabilities. |

### 22.4 FAILOVER SEQUENCE (ACTIVE-PASSIVE CLUSTER)

```
        [ Active Region (Asia-East1) ]      [ Passive Region (Asia-East2) ]
                      │                                    │
             [ Database Writes ]                  [ High-Availability Standby ]
                      │ (Streaming Replication)            │
                      └───────────────────────────────────►│ (Secondary Promotion)
```

1. **Detection:** Network monitors register consecutive ping failures for the active production route.
2. **Database Promotion:** Standby Postgres instances in the passive target region are promoted to Master status.
3. **DNS Re-routing:** Global Load Balancers adjust DNS records, routing incoming traffic away from the failed active site.
4. **Validation:** Health check scripts verify database access and confirm active connections.

---

## DOCUMENT 23: MONITORING & OBSERVABILITY GUIDE

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-MOG-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / TECHNICAL OPERATIVE
* **Author:** Principal SRE Architect
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Principal SRE | Logging, tracing, and alert matrices. | Head of Site Reliability |

---

### 23.1 PURPOSE
This document details monitoring setups, operational dashboards, metric tracking, and alerting rules for EDROS.

### 23.2 INTENDED AUDIENCE
* **DevOps Specialists & SREs**
* **Technical Product Managers**
* **NOC Engineers**

### 23.3 KPI MONITORING REGISTER
The platform monitors critical operational and technical KPIs:

1. **PTP (Promise to Pay) Conversion Rate:** Tracks the percentage of promised collections successfully processed.
2. **MFA Latency:** Measures the speed of multi-factor authentication checks.
3. **Database Locks:** Monitors row locks on the `assigned_cases` and `litigation_suits` tables.

---

## DOCUMENT 24: SECURITY & COMPLIANCE HANDBOOK

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-SCH-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / LEGAL & COMPLIANCE EXCLUSIVE
* **Author:** Chief Information Security Officer (CISO)
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Chief Security Officer | Regulatory alignment and audit requirements. | Global Risk Committee |

---

### 24.1 PURPOSE
This handbook documents security configurations, data encryption keys, and regulatory alignments (ISO 27001, SOC 2, and GLBA) implemented across EDROS.

### 24.2 INTENDED AUDIENCE
* **CISO & Security Analysts**
* **Data Privacy Officers**
* **Regulatory Compliance Auditors**

### 24.3 DATA SECURITY CONSTRAINTS
* **Encryption at Rest:** Sensitive client records are encrypted at rest using AES-256. Secure PDFs inside the vault utilize a secondary 128-bit RC4 Stream Seal.
* **Encryption in Transit:** All external traffic is restricted to TLS 1.3 over port 443.

---

## DOCUMENT 25: QA & TESTING HANDBOOK

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-QAH-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / QUALITY ASSURANCE
* **Author:** Chief QA Automation Architect
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Chief QA Architect | Initial QA roadmap & automation setup. | Director of Quality Engineering |

---

### 25.1 PURPOSE
This handbook details the testing strategies, automation test suites, and validation guidelines used to verify the functional integrity of EDROS releases.

### 25.2 INTENDED AUDIENCE
* **QA Test Managers**
* **Automation Test Engineers**
* **Release Verification Engineers**

### 25.3 TEST SUITE ARCHITECTURE (PLAYWRIGHT)
EDROS uses Playwright for comprehensive, automated E2E testing. Tests are designed for maximum stability by avoiding brittle CSS classes and utilizing resilient selectors like `data-testid`, ARIA roles, and semantic labels.

```
                  [ Playwright Runner ]
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
       [ AuthPage ]  [ RecoveryPage ] [ LegalPage ]
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                  [ Local Sandbox Browser ]
```

#### Playwright Page Object Model (POM) Structure:
* **`AuthPage`:** Automates multi-factor authentication and credentials dispatch.
* **`DashboardPage`:** Validates console navigation tabs.
* **`EmployeePage`:** Verifies operator roster changes and GPS attendance punches.
* **`RecoveryPage`:** Simulates collection telecalls, field visits, and settlement approvals.
* **`LegalPage`:** Validates court suit registrations and legal notices.
* **`DocumentsPage`:** Controls secure file uploads and PDF merges.
* **`SettingsPage`:** Audits role permission matrices and sandbox role changes.

---
