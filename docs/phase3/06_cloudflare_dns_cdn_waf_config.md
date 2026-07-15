# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-DEPLOY-006
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 6: CLOUDFLARE DNS, CDN & WAF CONFIG

```
================================================================================
          C L O U D F L A R E   D N S ,   C D N   &   W A F   C O N F I G
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Principal Cloud Security Engineer & Architect
Co-Authors:   Lead Network SRE, Senior Systems Architect
Reviewer:     Principal Infrastructure Engineer, Chief Information Security Officer
Approver:     Chief Technology Officer & Security Review Committee
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline issue of the Cloudflare DNS, CDN & WAF Config for EDROS v1.0.0. | Principal Cloud Security Engineer | CTO & Security Committee |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [CLOUDFLARE EDGE INGRESS & ARCHITECTURAL OVERVIEW](#2-cloudflare-edge-ingress--architectural-overview)
3. [DNS TOPOGRAPHY & SUBDOMAIN ROUTING SCHEMAS](#3-dns-topography--subdomain-routing-schemas)
4. [CDN CACHING STANDARDS & BYPASS POLICIES](#4-cdn-caching-standards--bypass-policies)
5. [WAF SECURITY RULES & PERIMETER PROFILING](#5-waf-security-rules--perimeter-profiling)
6. [GEOGRAPHIC ACCESS CONTROLS (GEO-IP LOCKS)](#6-geographic-access-controls-geo-ip-locks)
7. [SSL/TLS ENCRYPTION & AUTHENTICATED ORIGIN PULLS](#7-ssltls-encryption--authenticated-origin-pulls)
8. [DDOS MITIGATION & API RATE LIMITING](#8-ddos-mitigation--api-rate-limiting)
9. [PERFORMANCE OPTIMIZATION (HTTP/3, BROTLY, EARLY HINTS)](#9-performance-optimization-http3-brotly-early-hints)
10. [COMMON ISSUES & EDGE TROUBLESHOOTING](#10-common-issues--edge-troubleshooting)
11. [VALIDATION CHECKLIST & EDGE SMOKE TESTING](#11-validation-checklist--edge-smoke-testing)
12. [GLOSSARY & REFERENCES](#12-glossary--references)
13. [APPENDIX](#13-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This guide establishes the physical configurations, security rules, caching policies, and DNS architectures of the **Cloudflare perimeter** network within the Enterprise Debt Recovery Operating System (EDROS). This manual ensures sub-second global asset delivery, complete resistance against DDoS attacks, and compliance with the regulatory standards governing financial information transmission.

### 1.2 Scope
This document governs all edge security and routing infrastructure managed within the EDROS Cloudflare Enterprise account:
* **DNS Resolution Engines:** DNS records, proxy parameters, record flattening, and wildcard subdomain routing.
* **Content Delivery Network (CDN):** Caching hierarchies, Edge vs. Browser TTLs, stale-while-revalidate triggers, and bypass-on-cookie configurations.
* **Web Application Firewall (WAF):** OWASP core ruleset activations, custom security profiles, SQL Injection blocking, and cross-site scripting mitigations.
* **TLS Encryption Layers:** Minimum TLS versions, cipher suite prioritization, and Authenticated Origin Pull (AOP) handshakes.
* **Rate Limiting & Traffic Management:** API protection rules, credential-stuffing blocks, and DDoS shielding.

### 1.3 Target Audience
This manual is prepared for:
* **Network SREs and DevOps Engineers** configuring DNS records, proxy routing, and caching behavior.
* **SecOps Specialists** managing firewall policies, reviewing WAF telemetry, and deploying threat overrides.
* **CISO and IT Directors** auditing transport encryption levels, geofence scopes, and edge-security compliance.

---

## 2. CLOUDFLARE EDGE INGRESS & ARCHITECTURAL OVERVIEW

The perimeter network is the unified gateway for all EDROS traffic. To protect core databases and worker pools from direct internet exposure, EDROS enforces a **Zero-Public-IP** architecture. All traffic must pass through Cloudflare's globally distributed Edge nodes before reaching internal infrastructure.

### 2.1 Edge Routing Architecture

```
                                 [ Operator / Debtor Browser ]
                                               │
                                               ▼ (DNS query resolved to Cloudflare Anycast IP)
                                 [ Cloudflare Edge Node ]
                                   ├── 1. DDOS Shield & WAF
                                   ├── 2. Geo-IP Indian Fence
                                   └── 3. CDN Caching Check
                                               │
                                 (HTTP/3 over TLS 1.3 Tunnel)
                                               │
                                               ▼
                              [ Vercel Edge Server / Origin ]
                                   └── Authenticates AOP Certificate
                                               │
                                               ▼
                                  [ Internal Database Pool ]
```

### 2.2 Perimeter Infrastructure Components
* **Anycast DNS Routing:** Resolves the EDROS primary domain (`edros-sanjay.com`) to Cloudflare's Anycast IP network, absorbing distributed traffic spikes near the client source.
* **Edge WAF & DDoS Shield:** Inspects layer 7 application payloads, blocking SQL Injection and Cross-Site Scripting (XSS) attacks before they reach backend servers.
* **Authenticated Origin Pull (AOP):** Restricts access to Vercel origin servers. The origin is configured to reject any request that does not present a valid, unique client certificate signed by Cloudflare's root Certificate Authority (CA).

---

## 3. DNS TOPOGRAPHY & SUBDOMAIN ROUTING SCHEMAS

To support dynamic multi-tenant banking portals (e.g., `hdfc.edros-sanjay.com`), the DNS architecture uses wildcard subdomain delegation routed through Cloudflare's proxy network.

### 3.1 Production DNS Zone Registry

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EDROS DNS RECORD REGISTRY                             │
├──────────────────────┬─────────────┬──────────────────────────┬─────────────┤
│ Domain Record        │ Type        │ Target Destination       │ Proxy State │
├──────────────────────┼─────────────┼──────────────────────────┼─────────────┤
│ `edros-sanjay.com`   │ A (Flatten) │ `cname.vercel-dns.com`   │ Proxied (橙)│
├──────────────────────┼─────────────┼──────────────────────────┼─────────────┤
│ `*.edros-sanjay.com` │ CNAME       │ `cname.vercel-dns.com`   │ Proxied (橙)│
├──────────────────────┼─────────────┼──────────────────────────┼─────────────┤
│ `api.edros-sanjay.com`│ CNAME      │ `edros-api-prod.railway` │ Proxied (橙)│
├──────────────────────┼─────────────┼──────────────────────────┼─────────────┤
│ `_acme-challenge`    │ TXT         │ Dynamic ACME Validation  │ DNS Only    │
└──────────────────────┴─────────────┴──────────────────────────┴─────────────┘
```

### 3.2 DNS Configuration Directives
* **Proxy Status (Orange Cloud):** Must be **enabled** for all operator and API DNS records. Disabling proxy mode exposes raw origin IPs, bypassing WAF protections.
* **CNAME Flattening:** Configured at the root domain (`edros-sanjay.com`) to allow root records to behave like standard CNAME pointers without violating RFC specs.
* **Wildcard Delegation:** Standard wildcard rules (`*.edros-sanjay.com`) are routed through Cloudflare proxy. Edge Middleware parses the incoming subdomain at runtime to resolve the corresponding banking tenant.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Cloudflare DNS Management Panel               |
| Capture the Cloudflare DNS dashboard showing the CNAME records for the root  |
| and wildcard subdomains, confirming the 'Proxied' status toggle is active.   |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 4. CDN CACHING STANDARDS & BYPASS POLICIES

To keep client interfaces responsive, the CDN caches static assets (such as CSS, Javascript, and UI fonts) at edge locations near the user. However, financial records and transactional data are strictly dynamic and must bypass caching completely.

### 4.1 Caching Behavior Matrix
Caching behavior is managed using **Cloudflare Cache Rules**:

```
┌─────────────────────────────────────────────────────────────┐
│                 CDN CACHING BEHAVIOR RULES                  │
├───────────────────┬───────────────────┬─────────────────────┤
│ Path Prefix       │ Edge TTL / Cache  │ Cache-Control Header│
├───────────────────┼───────────────────┼─────────────────────┤
│ `/assets/*`       │ Cache (30 Days)   │ public, immutable   │
├───────────────────┼───────────────────┼─────────────────────┤
│ `/favicon.ico`    │ Cache (7 Days)    │ public, max-age     │
├───────────────────┼───────────────────┼─────────────────────┤
│ `/api/*`          │ Bypass (No Cache) │ private, no-store   │
├───────────────────┼───────────────────┼─────────────────────┤
│ `/dashboard/*`    │ Bypass (No Cache) │ private, no-cache   │
└───────────────────┴───────────────────┴─────────────────────┘
```

### 4.2 Caching Bypass Configurations
* **Bypass-on-Cookie Rule:** If a request contains an active session cookie (e.g., `__Secure-EDROS-Session`), Cloudflare's edge cache is bypassed automatically, ensuring dynamic user dashboards render in real time.
* **API Route Caching Exclusions:** Dynamic backend API endpoints are configured with `Cache-Control: no-store, private` to prevent sensitive financial details from being stored in shared edge caches.

---

## 5. WAF SECURITY RULES & PERIMETER PROFILING

The Web Application Firewall (WAF) inspects layer 7 traffic to identify and block malicious payloads. WAF policies are structured using a priority-ordered ruleset.

### 5.1 Production WAF Ruleset Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EDROS WAF POLICY MATRIX                            │
├──────┬──────────────────────┬───────────────────────────────┬───────────────┤
│ Rule │ Policy Name          │ Trigger Condition             │ System Action │
├──────┼──────────────────────┼───────────────────────────────┼───────────────┤
│ 10   │ Local Geo-IP Lock    │ `ip.geoip.country ne "IN"`    │ Block (403)   │
├──────┼──────────────────────┼───────────────────────────────┼───────────────┤
│ 20   │ SQL Injection Block  │ `cf.threat_score gt 45`       │ Challenge     │
├──────┼──────────────────────┼───────────────────────────────┼───────────────┤
│ 30   │ OWASP Core Rules     │ Attack score triggers anomaly │ Block / Chal  │
├──────┼──────────────────────┼───────────────────────────────┼───────────────┤
│ 40   │ Bad Bot Filtering    │ `cf.client.bot_score lt 15`   │ Block         │
└──────┴──────────────────────┴───────────────────────────────┴───────────────┘
```

### 5.2 Critical WAF Security Directives
* **SQL Injection (SQLi) Protection:** Analyzes input payloads to block SQL queries injected into user forms, protecting Neon Serverless PostgreSQL databases.
* **Cross-Site Scripting (XSS) Protection:** Rejects requests containing inline Javascript execution vectors or suspicious script imports.
* **Command Injection Protection:** Blocks system shell characters (e.g., `;`, `&&`, and system directories) within query fields, securing containerized Railway workers.

---

## 6. GEOGRAPHIC ACCESS CONTROLS (GEO-IP LOCKS)

Because EDROS processes collections for financial organizations registered in India, access is restricted to authorized geographical zones using **Geo-IP Security Rules**.

### 6.1 Geographic Locking Policies
* **Primary Rule:** Any request originating from outside the geographic borders of the Republic of India (`ip.geoip.country ne "IN"`) is blocked at the perimeter. This reduces the application's attack surface and mitigates international botnets and scanning operations.
* **Whitelisted Overrides:** Specific external IP ranges (such as developer sandboxes, security auditing offices, and third-party API gateways) are added to a **Global Bypass List** to allow access from restricted regions.

---

## 7. SSL/TLS ENCRYPTION & AUTHENTICATED ORIGIN PULLS

To secure data-in-transit, EDROS enforces encryption across all client-to-edge and edge-to-origin connections.

### 7.1 Cipher Suite & TLS Profiling
* **Minimum TLS Version:** Set to **TLS 1.2**. TLS 1.3 is preferred and used automatically when supported by the client browser. Older, insecure protocols (TLS 1.0 and TLS 1.1) are disabled.
* **Strict Cipher Suites:** Only high-entropy, forward-secrecy cipher suites are permitted:

```
ECDHE-ECDSA-AES128-GCM-SHA256
ECDHE-RSA-AES128-GCM-SHA256
ECDHE-ECDSA-AES256-GCM-SHA384
```

### 7.2 Authenticated Origin Pulls (AOP) Configuration
To prevent attackers from bypassing Cloudflare protections and targeting the Vercel origin servers directly, EDROS uses **Authenticated Origin Pulls**:

```
[ Hacker Direct Attack ] ───► [ Vercel Origin IP ]
                                    │
                                    ▼ (AOP Verification)
                       [ Drops Connection Automatically ]
                         - Requires Cloudflare Client Cert
                         - Direct access is blocked
```

1. Generate a custom origin certificate within the **Cloudflare SSL/TLS Console**.
2. Configure Vercel Project Settings to enable **Authenticated Origin Pulls** and upload the certificate.
3. Vercel drops any incoming connection attempt that does not present this certificate, ensuring all incoming traffic has passed through Cloudflare's perimeter security checks.

---

## 8. DDOS MITIGATION & API RATE LIMITING

Cloudflare's integrated DDoS mitigation monitors traffic patterns automatically to absorb Layer 3, 4, and 7 volumetric attacks.

### 8.1 API Rate Limiting Thresholds
To prevent brute-force attacks on sensitive endpoints (such as `/api/auth/*`), Cloudflare rate-limits rapid requests at the edge:

```
┌─────────────────────────────────────────────────────────────┐
│                 PERIMETER RATE-LIMITING RULES               │
├───────────────────┬───────────────────┬─────────────────────┤
│ Target Path       │ Threshold Limit   │ Action on Breach    │
├───────────────────┼───────────────────┼─────────────────────┤
│ `/api/auth/*`     │ 5 Req / 10 Secs   │ Block (1 Hour)      │
├───────────────────┼───────────────────┼─────────────────────┤
│ `/api/payment/*`  │ 10 Req / 10 Secs  │ Challenge (Captcha) │
├───────────────────┼───────────────────┼─────────────────────┤
│ `/api/health`     │ 2 Req / 1 Sec     │ Block (15 Mins)     │
└───────────────────┴───────────────────┴─────────────────────┘
```

---

## 9. PERFORMANCE OPTIMIZATION (HTTP/3, BROTLY, EARLY HINTS)

In addition to security, Cloudflare provides several network-level performance optimizations.

### 9.1 Network Protocol Optimizations
* **HTTP/3 (QUIC):** Enabled to allow faster, multiplexed data transfers and faster recovery from packet loss over weak cellular networks.
* **Brotli Compression:** Compresses HTML, CSS, and Javascript assets using Brotli compression, reducing initial bundle transfer times by up to 20% compared to standard GZIP.
* **Early Hints (RFC 8297):** Allows the Edge server to send asset preloading links to client browsers while backend API servers compile dynamic layouts, reducing initial page render times.

---

## 10. COMMON ISSUES & EDGE TROUBLESHOOTING

Configuration changes at the perimeter can introduce routing issues, access blocks, or caching errors. This section outlines standard diagnostics and resolution procedures.

### 10.1 Origin Unreachable Errors (Cloudflare Error 522/524)
* **Symptom:** Users receive a Cloudflare error page: `Error 522: Connection timed out` or `Error 524: A timeout occurred`.
* **Diagnostic Steps:**
  1. Check Vercel status logs to confirm that the origin server is online and responding.
  2. Verify that the configured CNAME destination matches current Vercel URLs.
  3. Confirm that Authenticated Origin Pull certificates have not expired.
* **Resolution:** Re-upload valid AOP certificates or correct misconfigured origin routing paths.

### 10.2 Geo-IP False Positives
* **Symptom:** Legitimate operators located near regional borders or using virtual private networks are blocked at the perimeter.
* **Diagnostic Steps:** Open Cloudflare **WAF Security Logs** and filter by blocked IP addresses to identify the triggered firewall rule.
* **Resolution:** If the IP is verified as legitimate, add it to the custom **IP Whitelist Bypass Group** to restore access.

### 10.3 SSL Handshake Failures (Error 525/526)
* **Symptom:** Browsers display SSL errors: `Error 526: Invalid SSL certificate`.
* **Diagnostic Steps:** Verify that Cloudflare's SSL configuration is set to **Full (Strict)**. Confirm that origin SSL certificates are valid and have not expired.
* **Resolution:** Set the SSL mode to **Full (Strict)** and verify that the origin server possesses a valid, non-expired certificate signed by a recognized Certificate Authority.

---

## 11. VALIDATION CHECKLIST & EDGE SMOKE TESTING

SOP compliance requires the network security team to run this manual verification checklist immediately after performing DNS modifications or firewall updates:

```
+─────────────────────────────────────────────────────────────────────────────+
| PRODUCTION PERIMETER VALIDATION SIGN-OFF SHEET                              |
|                                                                             |
| Primary Domain:  [ edros-sanjay.com ]                                       |
| TLS Encryption:  [ Enforced TLS 1.2+ ]                                      |
| NetSec Sign-Off: [ APPROVED / PROXIED ]                                     |
| CISO Sign-Off:   [ APPROVED / COMPLIANT ]                                   |
+─────────────────────────────────────────────────────────────────────────────+
```

### 11.1 Post-Deployment Smoke Test Actions
* [ ] **DNS Proxy Verification:** Perform DNS lookups (using `dig` or `nslookup`) to confirm that CNAME and root records resolve exclusively to Cloudflare Anycast IPs.
* [ ] **TLS Enforcement Verification:** Attempt to connect using TLS 1.0 or TLS 1.1 to confirm that the server drops unsecure connection attempts.
* [ ] **Geo-IP Fence Verification:** Access the site from outside India (using an external testing network) to verify that the Geo-IP firewall blocks access as expected.
* [ ] **AOP Origin Lock Verification:** Attempt to query origin servers directly (bypassing Cloudflare proxies) to verify that direct access is blocked.
* [ ] **WAF Payload Protection Test:** Submit test payloads (e.g., mock SQL injection strings) to verify that the edge firewall triggers blocks as expected.

---

## 12. GLOSSARY & REFERENCES

### 12.1 Glossary of Terms
* **AOP:** Authenticated Origin Pull. A security handshake that requires origin servers to validate client certificates signed by Cloudflare before accepting connections.
* **Anycast:** A network routing protocol that redirects client queries to the nearest geographic DNS server, reducing latency and absorbing traffic spikes.
* **Geo-IP Lock:** A perimeter firewall configuration that restricts application access to authorized geographic locations.
* **WAF:** Web Application Firewall. A security system that monitors and filters layer 7 application traffic to block malicious exploits.
* **TTL:** Time-To-Live. A caching parameter that defines how long an asset remains cached at edge locations before it is refreshed.

### 12.2 References
1. **Cloudflare Enterprise Guide:** Configuring DNS proxy, firewall policies, and Anycast routing.
2. **Vercel Integration Manual:** Setting up Authenticated Origin Pull and custom domain pointers.
3. **OWASP Core Security Standard:** Web application security guidelines and threat-prevention strategies.
4. **Reserve Bank of India (RBI) Regulations:** Infrastructure security and geographic data residency compliance guidelines.

---

## 13. APPENDIX

### 13.1 Production Perimeter Deployment Record
Upon successful verification of a Cloudflare update or domain migration, the SRE team must log the operation details using this structured template:

```
PRODUCTION PERIMETER RELEASE RECORD:
Release ID:     REL-CLOUDFLARE-2026-0201
Date Logged:    2026-07-15 07:00:00 UTC
Domain Target:  edros-sanjay.com
WAF Baseline:   OWASP Ruleset v2.4 (Strict block configuration)
AOP Status:     ACTIVE (Origin certificate verified)
Performance:    HTTP/3 Enabled, Brotli Compression Active
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
