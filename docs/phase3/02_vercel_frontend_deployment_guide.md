# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-DEPLOY-002
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 2: VERCEL FRONTEND DEPLOYMENT GUIDE

```
================================================================================
              V E R C E L   F R O N T E N D   D E P L O Y M E N T
                                 G U I D E
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Principal Frontend Architect
Co-Authors:   Lead DevOps Engineer, Senior SRE
Reviewer:     Principal Site Reliability Engineer, Lead Cloud Security Engineer
Approver:     Chief Technology Officer & Architecture Steering Committee
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline issue of the Vercel Frontend Deployment Guide for EDROS v1.0.0. | Principal Frontend Architect | CTO & Architecture Steering Committee |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [VERCEL PLATFORM INGRESS SYSTEM & INTEGRATION PRINCIPLES](#2-vercel-platform-ingress-system--integration-principles)
3. [ENVIRONMENT VARIABLES & SECURITY REGISTRY](#3-environment-variables--security-registry)
4. [PROJECT STRUCTURE, BUILD OVERRIDES & DEV COMMANDS](#4-project-structure-build-overrides--dev-commands)
5. [VERCEL CONFIGURATION SCHEMA (`vercel.json`)](#5-vercel-configuration-schema-verceljson)
6. [EDGE MIDDLEWARE & TENANT HYDRATION FLOW](#6-edge-middleware--tenant-hydration-flow)
7. [CI/CD INTEGRATION & GITHUB ACTIONS RELEASES](#7-cicd-integration--github-actions-releases)
8. [ZERO-DOWNTIME ROLLOVERS, CANARIES & PROMOTIONS](#8-zero-downtime-rollovers-canaries--promotions)
9. [FRONTEND PERFORMANCE OPTIMIZATIONS](#9-frontend-performance-optimizations)
10. [COMMON DEPLOYMENT MISTAKES & TROUBLESHOOTING](#10-common-deployment-mistakes--troubleshooting)
11. [VALIDATION CHECKLIST & POST-DEPLOYMENT SMOKE TESTING](#11-validation-checklist--post-deployment-smoke-testing)
12. [GLOSSARY & REFERENCES](#12-glossary--references)
13. [APPENDIX](#13-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This guide defines the engineering policies and deployment standards for hosting the Frontend Console and Client APIs of the Enterprise Debt Recovery Operating System (EDROS) on Vercel. This document provides step-by-step instructions to configure, deploy, secure, optimize, and roll back the EDROS web layer. It ensures that the deployment process remains consistent across all development, staging, and production environments.

### 1.2 Scope
This document covers all user-facing systems, operator portals, and backend-for-frontend (BFF) proxy networks running within the EDROS Vercel workspace:
* **The Architect & Operator Portal:** The interactive React/Vite interface managed by Sanjay Dangi Associates' personnel.
* **Serverless Edge APIs:** Lightweight serverless routes handling authentication, rate-limiting, and schema routing.
* **Domain & Routing Infrastructure:** Wildcard subdomain routing, DNS mapping, Edge-level CDN caching, and custom header injections.
* **Edge Security Profiles:** Content Security Policies (CSP), Cross-Origin Resource Sharing (CORS), and Vercel Firewall Rule configurations.

### 1.3 Target Audience
This manual is written for:
* **Frontend Developers and Platform Engineers** responsible for managing, scaling, and maintaining the EDROS client application.
* **DevOps Specialists and SREs** orchestrating deployment pipelines, environment parameters, and DNS migrations.
* **SecOps Auditors** verifying data-in-transit security, tenant isolation, and regulatory compliance.

---

## 2. VERCEL PLATFORM INGRESS SYSTEM & INTEGRATION PRINCIPLES

The frontend layer serves as the unified entry point for all EDROS users. To ensure sub-second response times and continuous availability, EDROS decouples the static client bundle from background computation by leveraging Vercel's global Edge Network.

### 2.1 Multi-Cloud Decoupling Scheme
Vercel is not an isolated hosting platform; it operates as the Edge controller in EDROS's multi-cloud mesh:

```
                                  [ User Browser ]
                                         │
                                         ▼ (HTTPS / TLS 1.3)
                           [ Cloudflare Edge CDN & WAF ]
                                         │
                                         ▼ (Secure Proxy Tunnel)
                             [ Vercel Edge Ingress ]
                                         │
               ┌─────────────────────────┴─────────────────────────┐
               ▼ (Static Assets & Edge API)                        ▼ (Deferred Jobs)
     [ React Frontend Hub ]                               [ Railway Workers ]
       ├── Vite Static Bundles                             ├── BullMQ Background Processors
       └── Edge Session Check                              └── Heavy File RC4 Encryption
               │                                                   │
               └─────────────────────────┬─────────────────────────┘
                                         ▼ (Secure Connection Pool)
                            [ Neon Serverless PostgreSQL ]
```

### 2.2 Vercel System Roles & Capabilities
* **Dynamic Static Delivery (SSG/ISR):** Pre-compiled dashboards are cached at Vercel’s edge locations, minimizing Page Speed Index metrics.
* **Edge Routing Engine:** Performs sub-millisecond wildcard routing to isolate banking tenants on independent subdomains before requests touch core database services.
* **Serverless Backend-for-Frontend (BFF) Proxy:** Masks internal database strings, Upstash credentials, and heavy background worker URLs behind local `/api/*` proxies, protecting critical infrastructure.

---

## 3. ENVIRONMENT VARIABLES & SECURITY REGISTRY

EDROS enforces zero client-side exposure of platform secrets. Any environment variable introduced into the Vercel workspace must adhere strictly to the prefix classification registry.

### 3.1 Prefix Classification Policy
* **`VITE_` Prefix (Client Exposed):** Only variables prefixed with `VITE_` are compiled into the React browser bundle. These variables are visible in browser developer tools and must **never** contain passwords, private keys, or internal API tokens.
* **No Prefix (Serverless Only):** Environment variables without the `VITE_` prefix remain strictly server-side. They are encrypted at rest using Vercel’s Key Management Service (KMS) and are injected only into Serverless or Edge functions.

### 3.2 System Environment Variables Registry

| Variable Name | Environment Scope | Exposure Level | Purpose / Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Dev / Staging / Prod | Server-Side | Sets compilation parameters (`production` or `development`). |
| `DATABASE_URL` | Staging / Prod | Server-Side | Primary connection string for Neon Serverless PostgreSQL database. |
| `REDIS_URL` | Staging / Prod | Server-Side | Connection URL to the Upstash serverless cache cluster. |
| `UPSTASH_REDIS_REST_TOKEN` | Staging / Prod | Server-Side | Secure token to manage HTTP-based Upstash Redis queries. |
| `JWT_ACCESS_SECRET` | Staging / Prod | Server-Side | Cryptographic key used to sign and verify operator sessions. |
| `GEMINI_API_KEY` | Staging / Prod | Server-Side | Secure API token for server-side generative AI analytics modules. |
| `CLOUDFLARE_R2_ACCESS_KEY` | Staging / Prod | Server-Side | Access credential to read/write files in Cloudflare R2 object storage. |
| `CLOUDFLARE_R2_SECRET_KEY` | Staging / Prod | Server-Side | Secret key to write collections, invoices, and photo streams to R2. |
| `VITE_EDROS_APP_NAME` | All | Client-Side | Human-readable app name compiled into page layouts. |
| `VITE_API_BASE_URL` | All | Client-Side | Points to the localized BFF API gateway (defaults to `/api`). |

> **CRITICAL SECURITY STANDARD:** If any API key (e.g., `GEMINI_API_KEY` or `CLOUDFLARE_R2_SECRET_KEY`) is mistakenly prefixed with `VITE_`, the Vercel build pipeline will fail immediately via a custom pre-build validation check script. Security personnel receive automated alerts for instant rotation of the exposed secret.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Vercel Environment Variables Console         |
| Capture the Environment Variables panel in the Vercel settings, showing the  |
| decrypted values hidden and specific scopes assigned (Production vs. Dev).   |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 4. PROJECT STRUCTURE, BUILD OVERRIDES & DEV COMMANDS

Vercel reads the directory configuration during initialization. Standard React-Vite project defaults are overwritten using EDROS-specific build optimizations.

### 4.1 Folder Structuring Schema
Vercel handles the static assets compiled from the `/src` and `/public` directories. The core components of the layout include:
* `/index.html`: Web wrapper and primary mount targets.
* `/src/main.tsx`: Entry point for client initialization.
* `/src/App.tsx`: Main React component container.
* `/vercel.json`: Routing, headers, and build behaviors configuration file.
* `package.json`: System dependencies, engines, and run-scripts declarations.

### 4.2 Project Build Settings (Vercel Project Dashboard)
Configure the following parameters in the Vercel Build & Development settings:

```
┌─────────────────────────────────────────────────────────────┐
│                 VERCEL COMPILER CONFIGURATION               │
├───────────────────┬─────────────────────────────────────────┤
│ Build Command     │ npm run build                           │
├───────────────────┼─────────────────────────────────────────┤
│ Output Directory  │ dist                                    │
├───────────────────┼─────────────────────────────────────────┤
│ Install Command   │ npm install                             │
├───────────────────┼─────────────────────────────────────────┤
│ Node.js Version   │ 20.x (LTS)                              │
└───────────────────┴─────────────────────────────────────────┘
```

### 4.3 Package.json Scripts Overview
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview --port 3000"
}
```

---

## 5. VERCEL CONFIGURATION SCHEMA (`vercel.json`)

To guarantee strict compliance with data residency, security headers, and Single Page Application (SPA) routing, the `vercel.json` file in the project root must match this enterprise schema:

```json
{
  "version": 2,
  "github": {
    "silent": true,
    "enabled": true
  },
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://*.cloudflare.net; connect-src 'self' https://*.vercel.app https://api.edros-sanjay.com; frame-ancestors 'none'; object-src 'none';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(self), microphone=(self), geolocation=(self)"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.edros-sanjay.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 5.1 Security Config Rules Breakdown
* **Content-Security-Policy (CSP):** restructures browser asset loading parameters. Blocks script executions from non-trusted CDNs, neutralizing Cross-Site Scripting (XSS) attacks.
* **Strict-Transport-Security (HSTS):** Enforces HTTPS browser routing for 2 years, shielding operators from SSL stripping or downgrade exploits.
* **Single Page Application Rewrite:** Dynamically forwards client-side React routes to the compiled `/index.html` file, preserving clean client-side routing.
* **API Redirection Proxy:** Transparently forwards `/api/*` endpoints to the secure, isolated API gateway, hiding internal service addresses.

---

## 6. EDGE MIDDLEWARE & TENANT HYDRATION FLOW

EDROS employs a multi-tenant model. Rather than provisioning independent frontend platforms for every client bank, a single Vercel deployment dynamically adjusts its branding, database mappings, and access rules based on the incoming domain name.

### 6.1 Tenant Ingress and Hydration Sequence

```
[ Debtor Browser / Bank Portal ]
              │
              ▼ (Request to: "hdfc.edros-sanjay.com/dashboard")
      [ Vercel Edge Router ]
              │
              ▼ (Executes Edge Middleware)
    1. Parse Subdomain: "hdfc"
    2. Lookup tenant configurations in Upstash Redis cache
    3. Verify Tenant Status: "ACTIVE"
              │
              ├─────────────────────────────────────────────────┐
              ▼ (Matches Cache)                                 ▼ (Cache Miss / Suspended)
   [ Set Custom Headers ]                              [ Block Request ]
   - X-EDROS-Tenant-ID: "T_HDFC_0928"                  - Route to 403 Page
   - X-EDROS-Theme-Preset: "indigo"                    - Log security warning
              │
              ▼ (Vercel Origin serves page)
 [ Frontend hydrates with customized bank assets ]
```

### 6.2 Code Reference: `middleware.ts` (Edge Runtime)
This production middleware script intercepts requests at Vercel's edge, enforcing domain security and mapping active tenants before routing:

```typescript
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|assets|favicon.ico|.*\\.png$).*)"
  ],
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";

  // 1. Skip system operations routes
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_sdk")) {
    return NextResponse.next();
  }

  // 2. Identify the target tenant subdomain
  let tenantSubdomain = "";
  const hostParts = hostname.split(".");
  
  if (hostParts.length > 2) {
    tenantSubdomain = hostParts[0].toLowerCase();
  }

  // 3. Prevent loopings on primary admin portals
  if (tenantSubdomain === "" || tenantSubdomain === "www" || tenantSubdomain === "admin") {
    const res = NextResponse.next();
    res.headers.set("X-EDROS-Context", "SYSTEM_CORE");
    return res;
  }

  // 4. Verify tenant registration against serverless memory pool
  try {
    const checkUrl = `${process.env.REDIS_URL}/get/tenant:${tenantSubdomain}`;
    const response = await fetch(checkUrl, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to query metadata store.");
    }

    const data = await response.json();
    const tenantConfig = data.result ? JSON.parse(data.result) : null;

    if (!tenantConfig || tenantConfig.status !== "ACTIVE") {
      // Direct unauthorized subdomains to access forbidden page
      url.pathname = "/403";
      return NextResponse.rewrite(url);
    }

    // 5. Inject secure tenant context headers
    const responseObj = NextResponse.next();
    responseObj.headers.set("X-EDROS-Tenant-ID", tenantConfig.id);
    responseObj.headers.set("X-EDROS-Tenant-Name", tenantConfig.name);
    responseObj.headers.set("X-EDROS-Tenant-Theme", tenantConfig.theme);
    
    return responseObj;

  } catch (error) {
    console.error("Tenant evaluation failure at edge:", error);
    // On core network failure, redirect to degraded-mode recovery layout
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url);
  }
}
```

---

## 7. CI/CD INTEGRATION & GITHUB ACTIONS RELEASES

EDROS frontend code is versioned on GitHub. Direct production deployments are prohibited. All builds must flow through continuous integration validation checks.

### 7.1 Pipeline Integration Lifespans
* **On Pull Request (Staging target):** GitHub triggers an automated code analysis, formatting checks, and types compilation. Vercel generates an isolated **Preview Deployment** and injects the live link directly into the PR.
* **On Pull Request Merge (Main branch):** The code undergoes final compliance checks and automated E2E tests before Vercel builds the master static bundle, promoting the assets to the **Production Ring** with zero downtime.

```
┌─────────────────────────────────────────────────────────────┐
│                  CI/CD VALIDATION PIPELINE                  │
├───────────────┬─────────────────────────────────────────────┤
│ STEP 1        │ Developer pushes to branch `feature/auth`   │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 2        │ ESLint, Prettier, TypeScript checks run     │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 3        │ Vercel compiles isolated Preview Build      │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 4        │ QA executes Cypress/Playwright on Preview   │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 5        │ Security reviews code and approves merge    │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 6        │ Merged code promoted to Production URL      │
└───────────────┴─────────────────────────────────────────────┘
```

### 7.2 Release Pipeline Workflow: `.github/workflows/deploy-frontend.yml`
```yaml
name: EDROS Frontend Release Engine

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Project Dependencies
        run: npm ci

      - name: Execute Coding Standards Linter
        run: npm run lint

      - name: Validate TypeScript Compilation
        run: npm run build

  vercel-preview-release:
    needs: lint-and-validate
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Deploy Preview to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          alias-domains: |
            pr-${{ github.event.number }}.dev.edros-sanjay.com

  vercel-production-promotion:
    needs: lint-and-validate
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Deploy Production to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## 8. ZERO-DOWNTIME ROLLOVERS, CANARIES & PROMOTIONS

Vercel employs an immutable deployment model. Every time a build is triggered, Vercel creates a distinct, addressable container hash. This architecture guarantees reliable, zero-downtime updates and near-instant rollback capabilities.

### 8.1 Zero-Downtime Deployment Lifecycle
```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ 1. Immutable    ├─────►│ 2. Edge Routing  ├─────►│ 3. Atomic Switch │
│    Deployment   │      │    Check         │      │    to Live URL   │
│ Generate Hash   │      │ Verify Health    │      │ Instant Update   │
└─────────────────┘      └──────────────────┘      └──────────────────┘
```

1. **Build Generation:** A new commit is compiled. Vercel deploys the assets to a unique hash URL (e.g., `edros-client-8f2a93c.vercel.app`).
2. **Edge Health Check:** The Edge Network executes warm-up routines, checking network paths and caching layouts before directing user traffic to the build.
3. **Atomic Switch:** Once verified, Vercel updates the primary production DNS pointer (e.g., `portal.edros-sanjay.com`) to the new deployment hash. Active sessions transition seamlessly without losing local storage states.

### 8.2 Safe Canary Releases
For high-exposure software upgrades, EDROS uses Vercel's Canary split-routing:
* Select the target deployment from the **Vercel Deployments Console**.
* Navigate to **Feature Flags & Split Traffic**.
* Route a defined percentage (e.g., *10.00%*) of production traffic to the new deployment hash, leaving the remaining *90.00%* on the stable baseline.
* Monitor real-time logs and error tracking pools (Sentry). If metrics remain stable for 4 hours, scale the allocation to *100.00%*.

### 8.3 Ten-Second Emergency Rollback Procedure
If a production deployment introduces critical regressions or security issues:
1. Navigate to the **Vercel Project Dashboard**.
2. Go to the **Deployments Tab**.
3. Locate the previous stable deployment (marked by the green *Active* tag before the failure).
4. Click the options menu (three dots) and select **Instant Rollback**.
5. The Edge Network instantly routes all DNS records back to the selected deployment hash. 
6. Active sessions are restored to the stable codebase in under 10 seconds.

---

## 9. FRONTEND PERFORMANCE OPTIMIZATIONS

To maintain high collection velocities, the EDROS frontend must load instantly, even in areas with weak cellular coverage. The following performance standards are built into the frontend architecture.

### 9.1 Static Site Generation & Client Hydration
* **Static Shell Delivery:** Pre-render non-sensitive layouts (login forms, basic containers) to deliver a complete static page shell instantly.
* **Client-Side Data Fetching:** Fetch sensitive data—such as outstanding balances, debtor lists, and payment histories—client-side after session verification. This design ensures that unauthenticated users never download sensitive financial records.

### 9.2 Bundle Splitting & Code Partitioning
To keep initial bundle sizes under 250 KB, the build system leverages Vite's rollup optimizations:
* **Route-Based Lazy Loading:** Split major dashboard modules into isolated, lazy-loaded bundles using `React.lazy()` and `Suspense`. Users only download the code required for their specific role portal.
* **Component Chunking:** Pack heavy visualizations (e.g., Recharts or D3 modules) into separate bundle chunks that load only when a user opens the associated analytics tab.

```typescript
// Example of lazy loading of high-overhead modules
import React, { Suspense, lazy } from "react";
const BranchHierarchyChart = lazy(() => import("./components/HierarchyChart"));

export default function AnalyticsTab() {
  return (
    <div className="analytics-container">
      <Suspense fallback={<div className="loading-spinner">Loading Data Visualizer...</div>}>
        <BranchHierarchyChart />
      </Suspense>
    </div>
  );
}
```

---

## 10. COMMON DEPLOYMENT MISTAKES & TROUBLESHOOTING

Hosting a Single Page Application on serverless networks can introduce routing issues, environment variables mismatches, or caching errors. This section outlines the primary failure modes and their standard resolution procedures.

### 10.1 Build Failures & Asset Sync Errors
* **Symptom:** Vercel build log displays compilation failures: `Error: Command "npm run build" exited with code 1`.
* **Diagnostic Steps:**
  1. Check the local build output to confirm whether the linter failed or if there are TypeScript compilation errors.
  2. Verify that there are no case-sensitivity differences in file import statements (e.g., importing `./components/sidebar` instead of `./components/Sidebar`). Vercel's build environment runs on Linux, which enforces strict case sensitivity, whereas local macOS environments may overlook matching errors.
* **Resolution:** Correct case-matching errors or fix linter warnings. Ensure the project builds successfully locally by running `npm run build` before pushing to the repository.

### 10.2 Hydration & Router Redirect Loops
* **Symptom:** User logs in but receives a blank screen or experiences continuous page reloads on specific subdomains.
* **Diagnostic Steps:**
  1. Open browser developer tools and check for redirection loop errors (HTTP Status 302/301 loops).
  2. Inspect the custom headers injected by Vercel Edge Middleware.
* **Resolution:** Review the `vercel.json` rewrites and `middleware.ts` configurations. Confirm that system paths (such as `_next/static`, `/assets/`, and `/api/*` endpoints) are explicitly excluded from middleware evaluations.

### 10.3 Missing Serverless Environment Parameters
* **Symptom:** Client requests return `500 Internal Server Error` on API proxy queries or database connections.
* **Diagnostic Steps:**
  1. Check the Vercel Serverless Function Logs for error details.
  2. If the logs report `DATABASE_URL is undefined` or `REDIS_URL is missing`, check the project's environment variables.
* **Resolution:** Add the missing environment variables to the **Vercel Project Settings**. Deploy a new build to propagate these parameters to the active serverless execution environments.

---

## 11. VALIDATION CHECKLIST & POST-DEPLOYMENT SMOKE TESTING

SOP compliance requires the deployment team to run this manual verification checklist immediately after promoting any production release:

```
+─────────────────────────────────────────────────────────────────────────────+
| PRODUCTION VALIDATION SIGN-OFF SHEET                                        |
|                                                                             |
| Target URL:  [ portal.edros-sanjay.com ]                                    |
| Build Hash:  [ edros-prod-9a8b7c6 ]                                         |
| Deployer:    [ senior_devops@sanjay.com ]                                   |
| Sign-Off:    [ APPROVED / DEPLOYED ]                                        |
+─────────────────────────────────────────────────────────────────────────────+
```

### 11.1 Post-Deployment Smoke Test Actions
* [ ] **SSL Certification Check:** Confirm the deployment serves traffic over an active TLS 1.3 connection with zero security warnings.
* [ ] **Core Authentication Loop:** Test user authentication flows, checking that logins, multi-factor validations, and session storage behave as expected.
* [ ] **Tenant Isolation Routing:** Navigate to a designated tenant subdomain (e.g., `hdfc.edros-sanjay.com`) to confirm that branding assets, custom styling, and isolated tenant context headers hydrate correctly.
* [ ] **API Proxy Verification:** Run queries on backend services via the `/api/health` proxy to confirm the BFF routes requests successfully.
* [ ] **Rollback Capability Verification:** Confirm the previous stable build hash remains visible in the dashboard, ensuring rollback routes can execute in under 10 seconds if needed.

---

## 12. GLOSSARY & REFERENCES

### 12.1 Glossary of Terms
* **BFF:** Backend-for-Frontend. A design pattern that uses a lightweight proxy layer to handle security, authentication, and data format conversions before routing client requests to backend APIs.
* **SSG:** Static Site Generation. Compiling static HTML page layouts at build time to ensure near-instant initial page loads.
* **ISR:** Incremental Static Regeneration. A technique that allows static pages to be updated in the background without requiring a complete rebuild of the entire site.
* **HSTS:** HTTP Strict Transport Security. A security header that instructs browsers to communicate with the server exclusively using secure HTTPS connections.
* **KMS:** Key Management Service. A secure service used to encrypt and manage access to administrative credentials and cryptographic keys.

### 12.2 References
1. **Vercel Deployment Documentation:** Deploying Single Page Applications and Edge Functions.
2. **Vite Build System Guidelines:** Optimization and Rollup Config options for Vite projects.
3. **Web Application Security Standards (OWASP):** Best practices for securing frontend applications and managing client-side security headers.
4. **Reserve Bank of India (RBI):** Operational directives for debt collection systems and customer interaction rules.

---

## 13. APPENDIX

### 13.1 Production Deployment Sign-Off Template
Upon successful verification of a production release, the deploying engineer must log the deployment details using this structured template:

```
PRODUCTION DEPLOYMENT SIGN-OFF RECORD:
Deployment ID:  DEP-VERCEL-2026-0501
Date Logged:    2026-07-15 03:00:00 UTC
Target Host:    portal.edros-sanjay.com
Build Hash:     edros-client-8f2a93c
State:          ACTIVE & VERIFIED (Smoke testing completed)
Performance:    98/100 Lighthouse Performance Metric
Security:       A+ Security Headers Rating (Verified Content-Security-Policy)
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
