# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-GOV-SEC-002
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 2: ENTERPRISE INFORMATION SECURITY POLICY

```
================================================================================
         E N T E R P R I S E   I N F O R M A T I O N   S E C U R I T Y
                                   P O L I C Y
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Chief Information Security Officer (CISO)
Co-Authors:   Lead Security Engineer, Principal SRE
Reviewer:     Chief Compliance Officer (CCO), Chief Risk Officer (CRO)
Approver:     Chief Technology Officer & Security Review Board
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline release of the Enterprise Information Security Policy. | Chief Information Security Officer | CTO & Security Review Board |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [APPLICABLE STANDARDS & REGULATORY MANDATES](#2-applicable-standards--regulatory-mandates)
3. [DEFINITIONS](#3-definitions)
4. [ROLES & SECURITY RESPONSIBILITIES](#4-roles--security-responsibilities)
5. [INFORMATION CLASSIFICATION & DATA HANDLING](#5-information-classification--data-handling)
6. [IDENTITY MANAGEMENT & PROVISIONING](#6-identity-management--provisioning)
7. [AUTHENTICATION POLICY](#7-authentication-policy)
8. [AUTHORIZATION MODEL (RBAC & SOD)](#8-authorization-model-rbac--sod)
9. [CRYPTOGRAPHIC & ENCRYPTION CONTROLS](#9-cryptographic--encryption-controls)
10. [PASSWORD POLICY](#10-password-policy)
11. [ENDPOINT SECURITY POLICY](#11-endpoint-security-policy)
12. [NETWORK & PERIMETER SECURITY](#12-network--perimeter-security)
13. [APPLICATION SECURITY STANDARDS (OWASP ASVS)](#13-application-security-standards-owasp-asvs)
14. [CLOUD & MULTI-TENANT COMPUTE SECURITY](#14-cloud--multi-tenant-compute-security)
15. [MOBILE CLIENT SECURITY STANDARDS](#15-mobile-client-security-standards)
16. [INCIDENT REPORTING & EMERGENCY CHANNELS](#16-incident-reporting--emergency-channels)
17. [DECISION MATRIX & SECURITY RISK ACTIONS](#17-decision-matrix--security-risk-actions)
18. [SECURITY RISK MATRIX](#18-security-risk-matrix)
19. [REGULATORY COMPLIANCE MATRIX](#19-regulatory-compliance-matrix)
20. [GOVERNANCE CONTROLS & MONITORING SEALS](#20-governance-controls--monitoring-seals)
21. [SECURITY PERFORMANCE MEASURES (KPIS)](#21-security-performance-measures-kpis)
22. [BEST PRACTICES & EXCELLENCE STRATEGIES](#22-best-practices--excellence-strategies)
23. [COMMON MISTAKES & SECURITY GAP ANALYSIS](#23-common-mistakes--security-gap-analysis)
24. [AUDIT & VALIDATION CHECKLISTS](#24-audit--validation-checklists)
25. [REFERENCES & GLOSSARY](#25-references--glossary)
26. [APPENDIX](#26-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
The purpose of this document is to establish the definitive Enterprise Information Security Policy (EISP) for the Enterprise Debt Recovery Operating System (EDROS) at Sanjay Dangi Associates. This policy outlines the strategic security objectives, technical controls, identity parameters, encryption mandates, and emergency reporting workflows required to protect sensitive financial records, borrower data, and critical multi-cloud compute resources from unauthorized access, modification, or disclosure.

### 1.2 Scope
This policy applies to all environments, systems, nodes, networks, and resources associated with the EDROS platform, including:
* All physical endpoints, corporate laptops, and mobile collection devices.
* Multi-cloud infrastructure environments hosted on Vercel, Railway, Neon PostgreSQL, Upstash Redis, and Cloudflare R2/Edge.
* All employee records, system administrative logins, bank integration interfaces, client portals, and guest connections.
* Third-party contractors, recovery agencies, collection supervisors, and external auditors who interact with EDROS assets.

### 1.3 Target Audience
This security policy is written for:
* **The Chief Information Security Officer (CISO) and Security Operations Center (SOC)** to guide active threat modeling, security patching, and audit tracking.
* **Systems Administrators, SREs, and Platform Engineers** to implement and maintain exact network rules, database credentials, and container environments.
* **Mobile Field Executives and Branch Supervisors** to understand end-user device compliance and access limitations.
* **Financial Clients, Bank Security Teams, and ISO 27001 / SOC 2 Auditors** looking to verify system security controls and data-masking mechanisms.

---

## 2. APPLICABLE STANDARDS & REGULATORY MANDATES

The EISP of EDROS is built in alignment with international security standards and regional banking rules:

* **ISO/IEC 27001:2022:** Information security management system (ISMS) controls.
* **SOC 2 Trust Services Criteria:** Security, Availability, Processing Integrity, Confidentiality, and Privacy principles.
* **OWASP Application Security Verification Standard (ASVS) v4.0:** Standard for checking web application technical security controls.
* **RBI Information Security Guidelines:** Master Direction on Information Technology Framework, Cyber Security, and Digital Lending.
* **Digital Personal Data Protection (DPDP) Act, 2023:** Protecting personal borrower identifiers and managing user consent.

> **CRITICAL LEGAL NOTICE:** Any legislative and regulatory compliance mandates referenced in this document (such as India's DPDP Act 2023 or the Reserve Bank of India’s IT and Cyber Security directions) must be reviewed against the latest applicable legal and regulatory requirements prior to actual production implementation.

---

## 3. DEFINITIONS

* **Sovereign Multi-Tenancy:** A security architecture that ensures absolute logical separation between client-bank portfolios. Data is segregated so that tenant systems are unaware of other tenants' records.
* **Symmetric Encryption (AES-256-GCM):** A high-performance encryption algorithm that uses a single secret key to encrypt and decrypt data, with built-in integrity checking to prevent tampering.
* **Asymmetric Encryption (RSA-4096 / Elliptic Curve):** Cryptography using a public-private key pair, primarily used for securing APIs, database tunnels, and system logins.
* **JWT (JSON Web Token):** A compact, URL-safe means of representing claims to be transferred between two parties, cryptographically signed to prevent tampering.
* **Least Privilege Access:** A fundamental security principle requiring that users and systems be granted only the minimum access levels necessary to perform their specific tasks.

---

## 4. ROLES & SECURITY RESPONSIBILITIES

Securing EDROS is a coordinated effort managed across distinct security and operations roles:

```
[ Security Governance Hierarchy ]
                │
                ├──► Chief Information Security Officer (CISO) - Strategic Oversight
                │
                ├──► Security Operations Center (SOC) - Real-time Monitoring & Threats
                │
                ├──► SRE & DevOps Engineers - Identity and Port Configuration
                │
                └──► System Users & Operators - Endpoint Security & Credential Hygiene
```

* **Chief Information Security Officer (CISO):** Accountable for information security policies, cryptographic key management, threat mitigation plans, and compliance alignment.
* **Security Operations Center (SOC):** Responsible for real-time monitoring of Sentry alerts, WAF blocking events, and Cloudflare perimeter traffic logs.
* **SRE & DevOps Engineers:** Responsible for configuring environment secrets, database connection parameters, container images, and VPC security groups.
* **System Users & Operators:** Responsible for practicing credential hygiene, securing physical endpoints, and reporting security incidents immediately.

---

## 5. INFORMATION CLASSIFICATION & DATA HANDLING

EDROS classifies information into four distinct categories to ensure appropriate security controls and handling procedures are applied to all system assets:

```
┌─────────────────────────────────────────────────────────────┐
│               DATA CLASSIFICATION HIERARCHY                 │
├───────────────┬─────────────────────────────────────────────┤
│ LEVEL 4       │ Restricted (PII, Financial Records, Secrets)│
├───────────────┼─────────────────────────────────────────────┤
│ LEVEL 3       │ Confidential (Internal SOPs, Audits, Code)  │
├───────────────┼─────────────────────────────────────────────┤
│ LEVEL 2       │ Internal (Training Guides, Announcements)   │
├───────────────┼─────────────────────────────────────────────┤
│ LEVEL 1       │ Public (Marketing Materials, Brochures)     │
└───────────────┴─────────────────────────────────────────────┘
```

### 5.1 Data Handling Procedures by Level

| Metric / Procedure | Level 4: Restricted | Level 3: Confidential | Level 2: Internal | Level 1: Public |
| :--- | :--- | :--- | :--- | :--- |
| **Examples** | Debtor PII, Bank Accounts, DB Secrets | System Architecture, Audit Logs, API keys | Operational SOPs, HR Guides, Staff Lists | Public Brochures, Corporate Addresses |
| **Storage Rules** | Encrypted with AES-256, isolated storage vaults | Encrypted at rest, restricted internal access | Shared cloud folders with corporate access | Standard web servers, CDN caches |
| **Transmission** | TLS 1.3 only, cryptographically signed | TLS 1.2 minimum, encrypted API tunnels | Internal corporate networks | Unrestricted web routing |
| **Data Masking** | Active masking on user screens and logs | No masking, restricted to admins | N/A | N/A |
| **Disposal** | Cryptographic erasure, verified shredding | Standard digital erasure, overwrite cycles | Standard file deletion | N/A |

---

## 6. IDENTITY MANAGEMENT & PROVISIONING

EDROS maintains strict, centralized identity management to verify user identities and prevent credential-sharing vulnerabilities.

### 6.1 User Provisioning Lifecycle
1. **Request:** HR initiates a user onboarding request detailing the employee's role, physical branch, and supervisor mapping.
2. **Verification:** The Security Administrator verifies the request against the Role-Based Access Control (RBAC) matrix.
3. **Creation:** An account is provisioned in the directory with corporate email (`@sanjaydangi.com`) verification and multi-factor authentication (MFA) enabled.
4. **Issuance:** The user receives a secure link to configure their primary login credentials.
5. **Deprovisioning:** Upon employee termination, HR triggers an immediate account suspension, which revokes active sessions and disables the user profile in `< 5 minutes`.

---

## 7. AUTHENTICATION POLICY

To protect system resources, all authentication attempts must follow strict verification controls:

* **Multi-Factor Authentication (MFA):** MFA is required for all administrative, management, and field access portals. Standard SMS codes are prohibited; users must authenticate using hardware tokens or authenticator applications.
* **Token Authentication:** API sessions use secure, JSON Web Tokens (JWT) signed with RS256 algorithms. Tokens have a maximum lifetime of 1 hour, and refresh tokens are stored in secure, HttpOnly, SameSite cookies.
* **SSO Integration:** Corporate administrators authenticate using SAML 2.0 single sign-on (SSO) integrated with the company's identity directory.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Multi-Factor Authentication Verification      |
| Capture the system login UI demonstrating the password submission, followed|
| by the prompt for an authenticator app TOTP validation code.                |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 8. AUTHORIZATION MODEL (RBAC & SOD)

EDROS enforces strict Role-Based Access Control (RBAC) and Segregation of Duties (SoD) to prevent privilege abuse and unauthorized transactions.

### 8.1 Predefined Security Roles
* **Super Administrator:** Platform-wide oversight. Managing tenant bank structures, corporate branches, and global settings.
* **Supervisor / Branch Manager:** Local branch oversight. Assigning targets, managing rosters, and approving standard settlements.
* **Recovery Agent:** Accesses assigned debtor profiles, logging visit reports and submitting collection records.
* **Legal Analyst:** Managing court notices, filing cases, and updating SARFAESI auction records.

### 8.2 Segregation of Duties Rules
To prevent fraud and maintain internal control:
* Users with access to debtor portfolios and collection records cannot edit database configurations, API endpoints, or environment variables.
* Managers who approve settlement haircuts cannot initiate the settlement case, requiring multi-level authorization for active settlements.

---

## 9. CRYPTOGRAPHIC & ENCRYPTION CONTROLS

EDROS protects sensitive data both in transit and at rest using modern cryptographic protocols.

```
┌─────────────────────────────────────────────────────────────┐
│                 SYSTEM ENCRYPTION BLUEPRINT                 │
├───────────────┬─────────────────────────────────────────────┤
│ IN TRANSIT    │ TLS 1.3 enforced on all external endpoints  │
├───────────────┼─────────────────────────────────────────────┤
│ AT REST       │ AES-256 encryption on database volumes      │
├───────────────┼─────────────────────────────────────────────┤
│ SECURE DOCS   │ RC4 encrypted PDF files with custom key seals│
├───────────────┼─────────────────────────────────────────────┤
│ KEY STORAGE   │ Environment secrets managed by KMS vaults   │
└───────────────┴─────────────────────────────────────────────┘
```

### 9.1 Data in Transit
* All external HTTP requests must use HTTPS, enforcing TLS 1.3 with secure cipher suites (e.g. `TLS_AES_256_GCM_SHA384`). TLS 1.0 and 1.1 are disabled.
* Database connections to Neon PostgreSQL must use SSL mode (`sslmode=require`) to protect transactional data.

### 9.2 Data at Rest
* Relational database tables, Upstash Redis clusters, and Cloudflare R2 storage buckets are encrypted at rest using AES-256 encryption.
* Sensitive document exports, such as generated demand notices and court filings, are encrypted with custom passwords before being saved to R2 storage.

---

## 10. PASSWORD POLICY

All manual user credentials must follow strict password complexity requirements to minimize brute-force and credential-stuffing vulnerabilities.

### 10.1 Password Complexity Requirements

| Complexity Rule | Enforcement Value | Verification Method | Rationale |
| :--- | :---: | :--- | :--- |
| **Minimum Length** | 14 Characters | Form-level regex checks | Minimizes dictionary attack success rates. |
| **Character Sets** | 4 of 4 required | Upper, lower, numbers, symbols | Restricts password predictability. |
| **Expiration** | 90 Days | Database-triggered resets | Limits the window of opportunity for leaked keys. |
| **History Limit** | Last 12 passwords | Check against password history | Prevents cyclic repetition of similar passwords. |
| **Lockout Threshold** | 5 Attempts | Temporary IP/User suspension | Blocks brute-force automated login scans. |

---

## 11. ENDPOINT SECURITY POLICY

All physical devices accessing EDROS systems must be managed and monitored to prevent data leaks.

### 11.1 Corporate Endpoint Controls
* **MDM Enrollment:** Corporate laptops and systems must be enrolled in Mobile Device Management (MDM) platforms.
* **Disk Encryption:** Hard drives must use full disk encryption (e.g. BitLocker or FileVault) to protect cached data.
* **Antivirus:** Systems must run active endpoint protection software with daily definition updates.
* **No Local Data:** Storing database dumps, customer portfolios, or unencrypted keys on local drives is strictly prohibited.

---

## 12. NETWORK & PERIMETER SECURITY

EDROS uses a layered network architecture to protect compute resources from external threats.

```
                              [ PUBLIC INTERNET ]
                                       │
                                       ▼ (Port 443 / HTTPS)
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLOUDFLARE WAF PERIMETER                           │
│                                                                             │
│   - Enforces TLS 1.3 Handshakes       - Prevents SQL Injection (SQLi)       │
│   - Filters Cross-Site Scripting (XSS) - Blocks Malicious Bot Searches       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│     VERCEL COMPUTE CLOUD     │              │     RAILWAY CONTAINER POOL   │
│                              │              │                              │
│   - Serves UI Console        │              │   - Runs BullMQ Workers      │
│   - Decodes Signed User JWTs │              │   - Internal Database Access │
└──────────────────────────────┘              └──────────────────────────────┘
```

### 12.1 Outer Perimeter Protections
* **DDoS Mitigation:** Cloudflare Edge automatically handles and mitigates volumetric DDoS attacks before they reach downstream servers.
* **Web Application Firewall (WAF):** Enforces custom rules to intercept and block SQL injection (SQLi), Cross-Site Scripting (XSS), and malicious automated scrapers.
* **Rate Limiting:** IP-level rate-limiting rules block abusive endpoints exceeding normal usage thresholds (e.g. max 100 requests/minute per client IP).

---

## 13. APPLICATION SECURITY STANDARDS (OWASP ASVS)

To maintain software integrity, all code updates must follow OWASP Application Security Verification Standard (ASVS) practices:

* **Input Validation:** All client inputs are validated server-side using strict schema verification, blocking invalid payloads before processing.
* **Secure Output Encoding:** User-supplied strings are encoded before rendering to prevent Cross-Site Scripting (XSS) vulnerabilities.
* **Safe Database Queries:** Database queries use parameterized Prisma calls, preventing SQL injection (SQLi) risks.
* **Secure Cookies:** Session cookies are configured with `HttpOnly`, `Secure`, and `SameSite=Strict` flags to defend against cross-site scripting attacks.

---

## 14. CLOUD & MULTI-TENANT COMPUTE SECURITY

Because EDROS hosts data for multiple financial clients, multi-tenant compute environments must remain isolated.

* **Sovereign Multi-Tenancy:** Tenant databases are isolated at the schema level. Each query includes the client's tenant hash ID to ensure records remain segregated.
* **Stateless Compute:** Vercel serverless functions and Railway worker containers do not store state locally, preventing data from leaking between user sessions.
* **Minimal Docker Images:** Worker containers run on minimal Alpine Linux images to reduce vulnerability surfaces.

---

## 15. MOBILE CLIENT SECURITY STANDARDS

Field recovery agents interact with EDROS using a managed mobile application. This mobile client must enforce strict local device controls:

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                            MOBILE SAFETY RING                           │
  ├────────────────────────────────────┬────────────────────────────────────┤
  │ COORDINATE VERIFICATION            │ FACIAL IMAGE COMPRESSION           │
  │ - Validate GPS data against the    │ - Authenticate field visits by     │
  │   branch's assigned geofence.      │   capturing and processing photos. │
  ├────────────────────────────────────┼────────────────────────────────────┤
  │ LOCAL ENCRYPTED DATABASE           │ SCREEN CAPTURE RESTRICTION         │
  │ - Encrypt local sqlite storage     │ - Prevent data leaks by blocking   │
  │   with custom device keys.         │   screenshots inside the app.      │
  └────────────────────────────────────┴────────────────────────────────────┘
```

* **GPS Geofence Checks:** The mobile app verifies the executive's GPS coordinates before permitting check-in, blocking manual coordinate overrides.
* **Local Database Encryption:** Offline storage queues use encrypted local storage blocks with device-specific cryptographic keys.
* **Screenshot Prevention:** The mobile app disables manual screen captures and background window caching to prevent unauthorized copies of customer portfolios.

---

## 16. INCIDENT REPORTING & EMERGENCY CHANNELS

In the event of a security incident, the security team must follow a standardized emergency response protocol.

### 16.1 Threat Containment Pathway
1. **Detection:** Sentry alarms or WAF firewalls identify anomalous behavior, alerting the SOC on-call pager.
2. **Containment:** SREs isolate the affected servers, rotate compromised credentials, and block suspicious IP addresses.
3. **Investigation:** The response team audits database transaction logs and access records to assess data impact.
4. **Notification:** The DPO notifies corporate managers, clients, and regulatory authorities in compliance with data privacy guidelines.
5. **Post-Mortem:** The security team conducts a detailed post-incident review to identify root causes and update system rules.

---

## 17. DECISION MATRIX & SECURITY RISK ACTIONS

To guide emergency responses, security incidents are classified and handled based on threat levels:

```
+───────────────────────────────────────────────────────────────────────────────+
|                           INCIDENT THREAT COMPASS                             |
+──────────────────────────┬────────────────────────────────────────────────────+
| HIGH COMPROMISE          │ Immediately rotate DB keys and isolate containers.  |
| MEDIUM ABUSE             │ Suspend user accounts and audit session histories. |
| LOW THREAT               │ Log incident, patch dependencies, update rules.    |
+──────────────────────────┴────────────────────────────────────────────────────+
```

### 17.1 Technical Action Pathways

* **High Compromise (e.g., Leaked Master Keys):** Immediately rotate database secrets, isolate the affected compute servers, and invalidate all active session tokens.
* **Medium Abuse (e.g., Suspicious Operator Activity):** Suspend the associated user account, invalidate active JWT tokens, and audit session histories to verify data integrity.
* **Low Threat (e.g., Dependency Vulnerability):** Log the vulnerability ticket, schedule a dependency patch update, and verify system safety in the staging pipeline before deployment.

---

## 18. SECURITY RISK MATRIX

Potential security vulnerabilities are tracked alongside impact assessments and active mitigation plans:

| Identifier | Risk Description | Probability | Impact Severity | System Mitigation Action |
| :--- | :--- | :---: | :---: | :--- |
| **SEC-RSK-001** | Compromised database connection secrets. | Low | Critical | Rotate database credentials using secure KMS vaults every 90 days. |
| **SEC-RSK-002** | XSS attack resulting in user token theft. | Medium | High | Enforce `HttpOnly`, `Secure`, and `SameSite` flags on session cookies. |
| **SEC-RSK-003** | Unauthorized access from lost mobile devices. | Medium | High | Require biometric lock screens and support remote data-wipe commands. |
| **SEC-RSK-004** | Volumetric DDoS attack targeting APIs. | Medium | Medium | Mitigate traffic spikes at the edge using Cloudflare CDN and WAF rate-limiting. |

---

## 19. REGULATORY COMPLIANCE MATRIX

Security controls are mapped to regional regulations to ensure compliance across all operations:

| Regulation | Compliance Mandate | Enforced System Control | Verification Method |
| :--- | :--- | :--- | :--- |
| **DPDP Act (2023)** | Protect personal customer data (PII). | Encrypt data at rest using AES-256 and mask PII on general screens. | Audit schema configurations and check interface displays. |
| **DPDP Act (2023)** | Ensure right to data erasure. | Use structured soft-delete flags and verify cryptographic data-purging. | Check database records after delete triggers. |
| **RBI Guidelines** | Restrict collection contact hours. | Enforce system lockout rules outside of permitted hours (08:00 to 19:00).| Attempt out-of-hours requests and verify lockouts. |
| **ISO 27001** | Maintain comprehensive system logs. | Log all state-modifying actions to immutable audit ledgers. | Review search results in the system audit portal. |

---

## 20. GOVERNANCE CONTROLS & MONITORING SEALS

Compliance is maintained through automated technical controls built directly into the platform:

* **Signed PDF Invoices:** Generated invoices and court documents are cryptographically sealed with custom passwords to prevent tampering.
* **Verified GPS Tracking:** Mobile check-ins verify GPS coordinates against branch geofences, logging coordinate mismatch alerts to the audit trail.
* **Enforced Access Limits:** API calls are limited using IP-level rate limit counters inside Upstash Redis, blocking abusive endpoints exceeding normal usage thresholds.

---

## 21. SECURITY PERFORMANCE MEASURES (KPIS)

Security performance is tracked against key performance indicators (KPIs) to monitor platform defense metrics.

```
+─────────────────────────────────────────────────────────────────────────────+
| KEY PERFORMANCE SECURITY TARGETS                                            |
|                                                                             |
| Average Patch Time:        [ Target: < 24 Hours ]                           |
| Suspicious Session Blocks: [ Target: 100% Blocked ]                         |
| Ingress Latency Baseline:  [ Target: < 150ms ]                              |
| MFA Adoption Level:        [ Target: 100% Active ]                          |
+─────────────────────────────────────────────────────────────────────────────+
```

* **Average Patch Time:** Critical security patches must be tested and applied to production within 24 hours of discovery.
* **Suspicious Session Blocks:** 100% of logins from anomalous IPs or failing MFA checks must be blocked immediately.
* **MFA Adoption Level:** 100% of user accounts must have active MFA configurations.

---

## 22. BEST PRACTICES & EXCELLENCE STRATEGIES

* **Implement Least Privilege:** Never share admin accounts. Assign users to specific roles matching their daily responsibilities.
* **Mask PII in Logs:** Ensure system and application logs (such as Pino and Sentry streams) mask sensitive customer identifiers.
* **Conduct Pentests Annually:** Perform external penetration testing yearly to identify potential vulnerabilities and verify platform security controls.

---

## 23. COMMON MISTAKES & SECURITY GAP ANALYSIS

* **Storing Secrets in Version Control:** Committing API keys or database connection strings to the Git repository exposes credentials to unauthorized developers.
  * *Correction:* Store all secrets securely in Vercel and Railway environment configurations, and rotate keys every 90 days.
* **Unprotected Upload Folders:** Allowing public read access to Cloudflare R2 storage buckets can expose sensitive PDFs and customer records.
  * *Correction:* Configure R2 buckets to private, and serve sensitive documents exclusively using signed, short-lived URLs.
* **Allowing Out-of-Date App Runs:** Permitting outdated mobile app versions to connect to production APIs can introduce security risks.
  * *Correction:* Implement app-version checks on API endpoints, prompting users to update when connecting on older client builds.

---

## 24. AUDIT & VALIDATION CHECKLISTS

### 24.1 Security Verification Checklist
* [ ] **Key Rotation Check:** Verify that active API keys, session tokens, and database secrets are rotated.
* [ ] **Encryption Check:** Confirm that database connections use secure pgBouncer endpoints with SSL enforced.
* [ ] **WAF Rule Check:** Verify that Cloudflare Edge Web Application Firewall (WAF) rules are active and blocking SQLi and XSS payloads.

### 24.2 Compliance Validation Checklist
* [ ] **PII Masking Check:** Confirm that sensitive debtor PII is masked on screens accessed by general field executives.
* [ ] **Outreach Time-Gate Check:** Confirm that the platform automatically locks out outreach tools outside of RBI-permitted hours.
* [ ] **MFA Verification:** Confirm that all administrative accounts have active MFA configurations.

---

## 25. REFERENCES & GLOSSARY

### 25.1 References
1. **ISO/IEC 27001:2022:** Information Security, Cybersecurity, and Privacy Protection.
2. **NIST Special Publication 800-53:** Security and Privacy Controls for Information Systems and Organizations.
3. **Reserve Bank of India (RBI):** Master Direction on Information Technology Framework and Cyber Security.
4. **OWASP Top 10 Web Application Security Risks:** Standard awareness document for web application security.

### 25.2 Glossary of Terms
* **AES-256:** Advanced Encryption Standard with a 256-bit key length. A secure, high-performance symmetric encryption algorithm.
* **SameSite Cookie:** An attribute that helps defend against Cross-Site Request Forgery (CSRF) attacks by controlling cookie sharing.
* **RSA-4096:** A secure asymmetric cryptographic algorithm using a 4096-bit key size.
* **KMS:** Key Management Service. A secure cloud service used to store, manage, and rotate cryptographic keys and system secrets.
* **TOTP:** Time-Based One-Time Password. A dynamic, short-lived security code used for multi-factor authentication.

---

## 26. APPENDIX

### 26.1 System Security Port Registry
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
