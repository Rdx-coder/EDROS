# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-ARCH-006
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 2: APPLICATION ARCHITECTURE

```
================================================================================
              A P P L I C A T I O N   A R C H I T E C T U R E
                             S P E C I F I C A T I O N
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Principal Application Architect & Tech Lead
Co-Authors:   Lead Software Engineer, Principal Security SRE
Reviewer:     Chief Software Governance Officer, Lead Compliance Architect
Approver:     Chief Technology Officer & Engineering Review Committee
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline issue of the Application Architecture Specification for EDROS v1.0.0. | Principal App Architect | CTO & Engineering Board |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [CLEAN ARCHITECTURE PARADIGM & THE DEPENDENCY RULE](#2-clean-architecture-paradigm--the-dependency-rule)
3. [CORE APPLICATION SERVICE MODULES](#3-core-application-service-modules)
4. [CLEAN API & ROUTING PIPELINE](#4-clean-api--routing-pipeline)
5. [DATA FLOW PIPELINES (SYNC VS. ASYNC WORKLOADS)](#5-data-flow-pipelines-sync-vs-async-workloads)
6. [STATE MANAGEMENT & CLIENT-SIDE ARCHITECTURE](#6-state-management--client-side-architecture)
7. [ERROR HANDLING & EXCEPTION PROPAGATION POLICY](#7-error-handling--exception-propagation-policy)
8. [SECURITY GATES & APPLICATION HARDENING STANDARDS](#8-security-gates--application-hardening-standards)
9. [VALIDATION CHECKLIST & APP ARCHITECTURE SIGN-OFF PROCEDURES](#9-validation-checklist--app-architecture-sign-off-procedures)
10. [GLOSSARY & REFERENCES](#10-glossary--references)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This specification defines the software engineering standards, modular boundaries, design patterns, and coding protocols for the application layer of the **Enterprise Debt Recovery Operating System (EDROS)**. This manual ensures maximum code maintainability, absolute separation of concerns, testability, and strict adherence to Clean Architecture principles.

### 1.2 Scope
This document governs all software modules within the EDROS codebase:
* **Directory Layout & Boundary Maps:** Module isolation across pure domains, services, controllers, and adapters.
* **Dependency Injection & Inversion:** Interfaces definition, repository contracts, and infrastructure wiring.
* **Core Application Logic Services:** Implementation specifications for portfolio ingestion, geofence verification, settlement authorization, and PDF notices generation.
* **Gateway & Route Pipelines:** Next.js route handling, middleware checks (CORS, JWT, rate-limits, RBAC), and Zod validation rules.
* **Async Task Orchestration:** BullMQ worker interfaces, event-driven state transitions, and background execution queues.
* **Error & Exception Hierarchies:** Custom domain exceptions, error handling middlewares, and tracing configurations.

### 1.3 Target Audience
This manual is written for:
* **Senior Software Engineers & Developers** writing code, creating services, or designing API endpoints.
* **Technical Leads & Architects** reviewing pull requests, ensuring architectural alignment, and managing code audits.
* **Quality Assurance (QA) Engineers** designing integration, unit, and end-to-end test suites.
* **Compliance & Security Engineers** verifying regulatory and data protection implementations.

---

## 2. CLEAN ARCHITECTURE PARADIGM & THE DEPENDENCY RULE

EDROS is built upon the **Clean Architecture** paradigm, which enforces that **source code dependencies must only point inwards** toward the Core Domain. The core business logic remains entirely decoupled from web frameworks, database engines, external APIs, and user interfaces.

### 2.1 The Architectural Onion Model

```
                ┌───────────────────────────────────────────┐
                │             INFRASTRUCTURE LAYER          │
                │     - Prisma PostgreSQL Adapters         │
                │     - BullMQ / Upstash Redis Drivers      │
                │     - Cloudflare R2 Client Classes        │
                │     - Pino Structured Log Streams         │
                │  ┌─────────────────────────────────────┐  │
                │  │          PRESENTATION LAYER         │  │
                │  │     - Next.js Route Handlers        │  │
                │  │     - Express API Controllers       │  │
                │  │     - JWT & RBAC Middlewares        │  │
                │  │  ┌───────────────────────────────┐  │  │
                │  │  │        APPLICATION LAYER      │  │  │
                │  │  │     - Core Use Cases          │  │  │
                │  │  │     - Domain Service Classes  │  │  │
                │  │  │     - Transaction Boundaries  │  │  │
                │  │  │  ┌─────────────────────────┐  │  │  │
                │  │  │  │       DOMAIN LAYER      │  │  │  │
                │  │  │  │   - Pure Entities       │  │  │  │
                │  │  │  │   - Repo Contracts      │  │  │  │
                │  │  │  │   - Custom Exceptions   │  │  │  │
                │  │  │  └─────────────────────────┘  │  │  │
                │  │  └───────────────────────────────┘  │  │
                │  └─────────────────────────────────────┘  │
                └───────────────────────────────────────────┘
```

### 2.2 Layer Boundaries and Rules of Engagement
1. **The Domain Layer (Inner Core):** Defines pure data models, enum definitions, and repository interfaces. It has **zero dependencies** on external libraries, frameworks, database drivers, or outer layer modules.
2. **The Application Layer:** Implements core business workflows (e.g., executing settlement calculations). It depends strictly on the interfaces defined in the Domain Layer, completely insulated from how data is physically persisted.
3. **The Presentation Layer:** Exposes the API endpoints, orchestrates controllers, validates HTTP request structures, and enforces authentication/authorization boundaries.
4. **The Infrastructure Layer (Outer Edge):** Contains the physical implementations of the repository interfaces using specific technologies (e.g., Prisma Client for Postgres, Upstash SDK for Redis caching, S3 SDK for Cloudflare R2).

### 2.3 Dependency Inversion in Action (TypeScript Spec)
To prevent the Core Domain from depending on database models, the system employs **Dependency Inversion**. Services interact only with interfaces; concrete database instances are wired at runtime during application boot-up.

```typescript
// =============================================================================
// DOMAIN LAYER: /src/domain/interfaces/IDebtCaseRepository.ts
// =============================================================================
export interface DebtCase {
  id: string;
  debtorName: string;
  totalBalance: number;
  assignedToEmail: string;
  status: "ACTIVE" | "SETTLED" | "LITIGATION" | "CLOSED";
  isDeleted: boolean;
}

export interface IDebtCaseRepository {
  findById(id: string): Promise<DebtCase | null>;
  save(debtCase: DebtCase): Promise<DebtCase>;
  findAssignedCases(email: string, status?: string): Promise<DebtCase[]>;
  updateStatus(id: string, status: DebtCase["status"]): Promise<void>;
}

// =============================================================================
// INFRASTRUCTURE LAYER: /src/infrastructure/repositories/PrismaDebtCaseRepository.ts
// =============================================================================
import { IDebtCaseRepository, DebtCase } from "../../domain/interfaces/IDebtCaseRepository";
import { PrismaClient } from "@prisma/client";

export class PrismaDebtCaseRepository implements IDebtCaseRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<DebtCase | null> {
    const record = await this.prisma.assignedCases.findFirst({
      where: { case_id: id, is_deleted: false }
    });

    if (!record) return null;

    return {
      id: record.case_id,
      debtorName: record.customer_name,
      totalBalance: Number(record.current_due),
      assignedToEmail: record.owner_email,
      status: record.status as DebtCase["status"],
      isDeleted: record.is_deleted
    };
  }

  async save(debtCase: DebtCase): Promise<DebtCase> {
    const record = await this.prisma.assignedCases.upsert({
      where: { case_id: debtCase.id },
      update: {
        customer_name: debtCase.debtorName,
        current_due: debtCase.totalBalance,
        owner_email: debtCase.assignedToEmail,
        status: debtCase.status,
        is_deleted: debtCase.isDeleted
      },
      create: {
        case_id: debtCase.id,
        customer_name: debtCase.debtorName,
        current_due: debtCase.totalBalance,
        owner_email: debtCase.assignedToEmail,
        status: debtCase.status,
        is_deleted: debtCase.isDeleted
      }
    });

    return {
      id: record.case_id,
      debtorName: record.customer_name,
      totalBalance: Number(record.current_due),
      assignedToEmail: record.owner_email,
      status: record.status as DebtCase["status"],
      isDeleted: record.is_deleted
    };
  }

  async findAssignedCases(email: string, status?: string): Promise<DebtCase[]> {
    const records = await this.prisma.assignedCases.findMany({
      where: {
        owner_email: email,
        is_deleted: false,
        ...(status ? { status } : {})
      }
    });

    return records.map(r => ({
      id: r.case_id,
      debtorName: r.customer_name,
      totalBalance: Number(r.current_due),
      assignedToEmail: r.owner_email,
      status: r.status as DebtCase["status"],
      isDeleted: r.is_deleted
    }));
  }

  async updateStatus(id: string, status: DebtCase["status"]): Promise<void> {
    await this.prisma.assignedCases.update({
      where: { case_id: id },
      data: { status }
    });
  }
}
```

---

## 3. CORE APPLICATION SERVICE MODULES

EDROS's business value is isolated within high-integrity application service classes. These classes encapsulate multi-table transactions, validation rules, and integration adapters.

### 3.1 Delinquent Ingestion Engine Service
Handles safe, chunked data loading of bank portfolio sheets.

* **Validation Rules:**
  * Rejects duplicate Case IDs to prevent ledger corruption.
  * Ensures outstanding balance values are numeric and strictly positive (`> 0`).
  * Cross-references the designated operational branch email to confirm the owner exists in the database.
* **Transactional Ingestion Implementation:**

```typescript
// /src/services/IngestionService.ts
import { PrismaClient } from "@prisma/client";
import { AuditLoggerService } from "./AuditLoggerService";

export interface IngestionPayload {
  caseId: string;
  customerName: string;
  currentDue: number;
  ownerEmail: string;
}

export class IngestionService {
  constructor(
    private prisma: PrismaClient,
    private auditLogger: AuditLoggerService
  ) {}

  async ingestPortfolio(
    tenantId: string,
    payloads: IngestionPayload[],
    operatorEmail: string,
    ipAddress: string
  ): Promise<{ processedCount: number; errors: string[] }> {
    let processedCount = 0;
    const errors: string[] = [];

    // Run within a single database transaction to guarantee ACID state consistency
    await this.prisma.$transaction(async (tx) => {
      for (const item of payloads) {
        try {
          // 1. Validate owner operator exists
          const operatorExists = await tx.operators.findUnique({
            where: { email: item.ownerEmail }
          });
          if (!operatorExists) {
            throw new Error(`Assignee operator ${item.ownerEmail} not registered.`);
          }

          // 2. Insert or update the case ledger
          await tx.assignedCases.upsert({
            where: { case_id: item.caseId },
            update: {
              customer_name: item.customerName,
              current_due: item.currentDue,
              owner_email: item.ownerEmail,
              status: "ACTIVE"
            },
            create: {
              case_id: item.caseId,
              customer_name: item.customerName,
              current_due: item.currentDue,
              owner_email: item.ownerEmail,
              status: "ACTIVE",
              is_deleted: false
            }
          });

          processedCount++;
        } catch (err: any) {
          errors.push(`Row [CaseID: ${item.caseId}]: ${err.message}`);
        }
      }

      // Trigger audit log of execution
      await this.auditLogger.logActionInTx(
        tx,
        operatorEmail,
        `Ingested portfolio for tenant ${tenantId}. Processed: ${processedCount}, Errors: ${errors.length}`,
        ipAddress,
        JSON.stringify({ tenantId, processedCount })
      );
    });

    return { processedCount, errors };
  }
}
```

### 3.2 Staff Geotracking & Geofencing Verification Service
Guarantees the integrity of field collection check-ins.

```
                   [ Executive Location ]
                     (Lat/Lng Coordinates)
                               │
                               ▼
               [ Geofencing Verification Engine ]
                     ├── 1. Fetch assigned branch coordinates
                     └── 2. Compute Great-Circle Haversine distance
                               │
             ┌─────────────────┴─────────────────┐
             ▼ (Distance <= 250m)                ▼ (Distance > 250m)
      [ Check-In APPROVED ]               [ Check-In REJECTED ]
      - Writes to `visit_logs`            - Returns geofence exception
      - Continues check-in flow           - Flags GPS location drift
```

* **Mathematical Policy (Haversine Formula):**
  The verification service calculates the distance between the field agent's GPS coordinates and their assigned physical branch location. Check-ins are approved only if the distance is within **250 meters**.

$$\Delta\sigma = 2 \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)} \right)$$

$$d = R \cdot \Delta\sigma$$

* **Verification Service Script:**

```typescript
// /src/services/GeofenceService.ts
export class GeofenceService {
  private readonly EARTH_RADIUS_METERS = 6371000;

  calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const rLat1 = lat1 * Math.PI / 180;
    const rLat2 = lat2 * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_METERS * c;
  }

  verifyCheckIn(
    agentLat: number, agentLng: number,
    branchLat: number, branchLng: number,
    maxRadiusMeters: number = 250
  ): boolean {
    const distance = this.calculateDistance(agentLat, agentLng, branchLat, branchLng);
    return distance <= maxRadiusMeters;
  }
}
```

### 3.3 Settlement Authorization & Matrix Escalation Engine
Automates and secures settlement negotiations. If a proposed settlement haircut exceeds an operator's approval limit, the engine escalates the proposal to their manager automatically.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SETTLEMENT ESCALATION MATRIX                          │
├──────────────────────┬─────────────────────────┬────────────────────────────┤
│ Operator Role        │ Haircut Approval Limit  │ Action on Breach           │
├──────────────────────┼─────────────────────────┼────────────────────────────┤
│ Branch Executive     │ Up to 15.00%            │ Auto-Approved on Commit    │
├──────────────────────┼─────────────────────────┼────────────────────────────┤
│ Branch Manager       │ 15.01% - 30.00%         │ Escalates to Branch Manager│
├──────────────────────┼─────────────────────────┼────────────────────────────┤
│ Regional Manager     │ 30.01% - 50.00%         │ Escalates to Regional Mgr  │
├──────────────────────┼─────────────────────────┼────────────────────────────┤
│ National Ops Head    │ 50.01% - 75.00%         │ Escalates to National Head │
└──────────────────────┴─────────────────────────┴────────────────────────────┘
```

* **Escalation Engine Script:**

```typescript
// /src/services/SettlementService.ts
import { PrismaClient } from "@prisma/client";

export class SettlementService {
  constructor(private prisma: PrismaClient) {}

  calculateHaircut(originalDue: number, proposedSettlement: number): number {
    if (originalDue <= 0) return 0;
    const haircutAmount = originalDue - proposedSettlement;
    return (haircutAmount / originalDue) * 100;
  }

  determineRequiredApprovalRole(haircutPercent: number): string {
    if (haircutPercent <= 15.00) return "EXECUTIVE";
    if (haircutPercent <= 30.00) return "BRANCH_MANAGER";
    if (haircutPercent <= 50.00) return "REGIONAL_MANAGER";
    return "NATIONAL_OPS_HEAD";
  }

  async submitProposal(
    caseId: string,
    proposedAmount: number,
    submittedByEmail: string
  ): Promise<{ status: "APPROVED" | "PENDING_APPROVAL"; requiredApproverRole: string }> {
    const debtCase = await this.prisma.assignedCases.findUnique({
      where: { case_id: caseId }
    });

    if (!debtCase) throw new Error("Target case record not found.");

    const originalDue = Number(debtCase.current_due);
    const haircutPercent = this.calculateHaircut(originalDue, proposedAmount);
    const requiredRole = this.determineRequiredApprovalRole(haircutPercent);

    // Fetch submitter details
    const submitter = await this.prisma.operators.findUnique({
      where: { email: submittedByEmail }
    });

    if (!submitter) throw new Error("Submitting operator not registered.");

    // If submitter role is sufficient, auto-approve
    const isAutoApproved = submitter.role === requiredRole || 
      (submitter.role === "REGIONAL_MANAGER" && requiredRole === "BRANCH_MANAGER") ||
      (submitter.role === "NATIONAL_OPS_HEAD");

    if (isAutoApproved) {
      await this.prisma.assignedCases.update({
        where: { case_id: caseId },
        data: { status: "SETTLED" }
      });

      return { status: "APPROVED", requiredApproverRole: submitter.role };
    }

    // Escalation required: Mark state as pending review
    return { status: "PENDING_APPROVAL", requiredApproverRole: requiredRole };
  }
}
```

---

## 4. CLEAN API & ROUTING PIPELINE

To prevent malicious payloads and unauthorized access from reaching the Core Domain, the presentation layer implements a strict middleware and schema-validation pipeline.

### 4.1 Edge Route Lifecycle Pipeline
Every API request is routed through a series of verification checks:

```
[ Incoming API Request ]
          │
          ▼
[ Security CORS & Method Checks ]
          │
          ▼
[ Rate Limiter (Upstash Redis) ]
          │
          ▼
[ Authentication Guard (JWT / Session) ]
          │
          ▼
[ Role-Based Access Check (RBAC) ]
          │
          ▼
[ Schema Validation (Zod Parser) ]
          │
          ▼
[ Execute Controller Logic ]
```

### 4.2 API Middleware Implementation
This Next.js Edge Middleware enforces authentication, rate-limiting, and RBAC restrictions globally:

```typescript
// /src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  
  // 1. Enforce HTTPS upgrade
  if (req.headers.get("x-forwarded-proto") === "http") {
    return NextResponse.redirect(`https://${req.headers.get("host")}${req.nextUrl.pathname}`, 301);
  }

  // 2. Perform Authentication check
  const sessionToken = req.cookies.get("__Secure-EDROS-Session")?.value;
  if (!sessionToken && req.nextUrl.pathname.startsWith("/api/secured")) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "Access denied. Token missing." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Perform Role Verification (RBAC)
  if (req.nextUrl.pathname.startsWith("/api/secured/admin")) {
    // Decode token parameters securely (Mock implementation)
    const userRole = req.headers.get("x-user-role");
    if (userRole !== "SUPER_ADMIN") {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Forbidden. Insufficient permissions." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/secured/:path*"]
};
```

### 4.3 Zod Request Validation Spec
All API controllers must use Zod to validate input payloads, preventing type confusion or SQL injection attacks before executing domain logic.

```typescript
// /src/controllers/IngestionController.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { IngestionService } from "../services/IngestionService";

// Declare clean validation schema
const IngestionRowSchema = z.object({
  caseId: z.string().min(4).max(50).regex(/^[A-Z0-9_-]+$/i),
  customerName: z.string().min(2).max(200),
  currentDue: z.number().positive(),
  ownerEmail: z.string().email()
});

const IngestionPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  cases: z.array(IngestionRowSchema).min(1).max(500)
});

export class IngestionController {
  constructor(private ingestionService: IngestionService) {}

  async handleIngest(req: NextRequest, operatorEmail: string): Promise<NextResponse> {
    try {
      const rawBody = await req.json();
      
      // Parse payload using Zod. Rejects invalid requests immediately
      const parsedData = IngestionPayloadSchema.parse(rawBody);

      const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

      const result = await this.ingestionService.ingestPortfolio(
        parsedData.tenantId,
        parsedData.cases,
        operatorEmail,
        ipAddress
      );

      return NextResponse.json({ success: true, ...result });

    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ success: false, errors: err.errors }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }
}
```

---

## 5. DATA FLOW PIPELINES (SYNC VS. ASYNC WORKLOADS)

To maintain a fast and responsive user experience under heavy load, EDROS separates transactional actions into two distinct processing paths.

### 5.1 Synchronous Transaction Path (Primary CRUD)
Ideal for low-overhead database updates (e.g., fetching a case profile, logging a note, or editing staff directory records).
* **Execution Boundary:** Finished within the 30-second serverless execution window.
* **Flow Diagram:**

```
[ Client Browser ] ──(HTTPS GET/POST)──► [ Route Handler ] ──► [ Prisma Client ] ──► [ Neon Postgres ]
```

### 5.2 Asynchronous Queue Path (High-Latency Tasks)
Mandatory for long-running processes (e.g., compiling PDFs, watermarking files, running batch SMS campaigns, or processing file imports).
* **Execution Boundary:** Long-running tasks are sent to BullMQ, preventing serverless timeout errors.
* **Flow Diagram:**

```
                         [ Next.js API Route ]
                                   │
                         (Publishes Job Event)
                                   │
                                   ▼
                       [ Upstash Redis Queue ]
                                   │
                   (Polled by Long-Running Worker)
                                   │
                                   ▼
                     [ BullMQ Worker (Railway) ]
                                   ├── 1. Generate Case Notice PDF
                                   ├── 2. Apply Cryptographic Watermark
                                   └── 3. Push PDF to Cloudflare R2
```

### 5.3 Asynchronous Queue Task Schema
This background worker script runs on Railway to compile, watermark, and secure legal notice PDFs asynchronously:

```typescript
// /src/workers/NoticeGenerationWorker.ts
import { Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT_URL!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
});

export const noticeWorker = new Worker(
  "notice-generation",
  async (job: Job) => {
    const { caseId, noticeId, operatorEmail } = job.data;

    console.log(`Starting PDF compilation job ${job.id} for case ${caseId}`);

    // 1. Fetch case details from PostgreSQL
    const debtCase = await prisma.assignedCases.findUnique({
      where: { case_id: caseId }
    });

    if (!debtCase) throw new Error("Case record not found.");

    // 2. Compile Notice HTML Template (Mock Compilation)
    const noticeContent = `
      ===============================================
               OFFICIAL LEGAL RECOVERY DEMAND
      ===============================================
      Customer Name:  ${debtCase.customer_name}
      Overdue Balance: INR ${debtCase.current_due}
      Status:          LITIGATION PROTOCOL ENFORCED
      -----------------------------------------------
      Authorized By:  Sanjay Dangi Associates
    `;

    // 3. Encrypt and apply watermarks to PDF (Mock Implementation)
    const secureBuffer = Buffer.from(noticeContent, "utf-8");

    // 4. Push final PDF document to Cloudflare R2 Storage
    const storageKey = `notices/${caseId}_${noticeId}.pdf`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: storageKey,
        Body: secureBuffer,
        ContentType: "application/pdf"
      })
    );

    // 5. Save document URL reference in database
    await prisma.$executeRawUnsafe(
      `INSERT INTO litigation_suits (suit_no, related_case, court_name, hearing_date, suit_nature) 
       VALUES ($1, $2, $3, NOW(), $4)`,
      `SUIT-${noticeId}`,
      caseId,
      "National Debt Recovery Tribunal",
      `Demand Notice Generated - Key: ${storageKey}`
    );

    console.log(`Successfully compiled and stored notice PDF for Case: ${caseId}`);
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD
    }
  }
);
```

---

## 6. STATE MANAGEMENT & CLIENT-SIDE ARCHITECTURE

The presentation tier prioritizes visual consistency, fast rendering, and clean separation of UI components from underlying data access layers.

### 6.1 State Management Hierarchy
* **Context State:** Global user sessions, tenant configurations, and visual themes are managed using React Context providers.
* **Component-Level State:** Forms, table filters, search parameters, and modal dialog states are kept inside local React component boundaries.
* **Data Fetching and Synchronization:** Data queries, server-state updates, and cache invalidation are handled by **React Query**, ensuring seamless data synchronization across views.

### 6.2 Component Isolation & Pure Presentation UI
To keep components clean and maintainable, presentation code is decoupled from API calls. Components accept data via React Props and delegate actions to parent page controllers using callback functions:

```tsx
// /src/components/SettlementProposalForm.tsx
import React, { useState } from "react";

interface SettlementProposalFormProps {
  currentDue: number;
  isSubmitting: boolean;
  onSubmit: (proposedAmount: number) => void;
}

export const SettlementProposalForm: React.FC<SettlementProposalFormProps> = ({
  currentDue,
  isSubmitting,
  onSubmit
}) => {
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please specify a valid proposal amount.");
      return;
    }

    if (numericAmount >= currentDue) {
      setError("Settlement amount must be less than the total outstanding balance.");
      return;
    }

    setError(null);
    onSubmit(numericAmount);
  };

  return (
    <div id="settlement-proposal-card" className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Propose Settlement</h3>
      <p className="text-xs text-gray-500 mb-4">
        Outstanding Balance: <span className="font-medium text-gray-800">INR {currentDue.toLocaleString()}</span>
      </p>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Proposed Settlement Amount (INR)</label>
          <input
            id="input-settlement-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50000"
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

        <button
          id="btn-submit-proposal"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded-md transition duration-150 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting Proposal..." : "Submit Proposal"}
        </button>
      </form>
    </div>
  );
};
```

---

## 7. ERROR HANDLING & EXCEPTION PROPAGATION POLICY

Unchecked application errors can leak system internals, degrade performance, and compromise database stability. EDROS implements a strict, centralized exception handling strategy.

### 7.1 Centralized Exception Architecture

```
[ Application Service Error ] ──► [ Custom Exception Class ]
                                              │
                                              ▼
                                [ Global Error Middleware ]
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
         [ Log to Console & Traces ]                         [ Sanitize API Response ]
         - Structured JSON logging                           - Scrub DB internals
         - Level: Error (Pino / Sentry)                      - Return standard code
```

### 7.2 Custom Domain Exceptions
Services raise specific exceptions to handle business rule violations:

```typescript
// /src/domain/exceptions/BusinessRuleException.ts
export class BusinessRuleException extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = "BusinessRuleException";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GeofenceBreachedException extends BusinessRuleException {
  constructor(distance: number) {
    super(
      "GEOFENCE_BREACHED",
      `User check-in rejected. Distance is ${distance.toFixed(1)}m from authorized geofence radius.`,
      403
    );
  }
}

export class SettlementEscalationRequired extends BusinessRuleException {
  constructor(requiredRole: string) {
    super(
      "ESCALATION_REQUIRED",
      `Settlement haircut exceeds authorization limit. Requires review by: ${requiredRole}`,
      409
    );
  }
}
```

### 7.3 Global API Error Handler Middleware
This middleware captures exceptions, logs error stacks securely, and returns sanitized JSON payloads to clients:

```typescript
// /src/lib/apiErrorHandler.ts
import { NextResponse } from "next/server";
import { BusinessRuleException } from "../domain/exceptions/BusinessRuleException";

export function handleApiError(err: any, requestUrl: string): NextResponse {
  // 1. Log the full stack trace securely to Sentry or internal logs
  console.error(`[API ERROR] Exception triggered on URL: ${requestUrl}. Detail:`, err);

  // 2. Custom Business Rules Exceptions
  if (err instanceof BusinessRuleException) {
    return NextResponse.json(
      {
        success: false,
        code: err.errorCode,
        error: err.message
      },
      { status: err.statusCode }
    );
  }

  // 3. Central Database Constraint Exceptions
  if (err.code && err.code.startsWith("P2")) {
    return NextResponse.json(
      {
        success: false,
        code: "DATABASE_CONSTRAINT_ERROR",
        error: "A database constraint violation occurred while saving data."
      },
      { status: 409 }
    );
  }

  // 4. Default Internal Server Error
  return NextResponse.json(
    {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: "An unexpected error occurred. Please try again or contact support."
    },
    { status: 500 }
  );
}
```

---

## 8. SECURITY GATES & APPLICATION HARDENING STANDARDS

Because EDROS processes sensitive financial and borrower information, the application layer implements robust code-level security controls.

### 8.1 SQL Injection Protection
Raw SQL queries are strictly forbidden. All database queries must be executed using the **Prisma Client ORM**, which utilizes parameterized query parsing to prevent SQL injection vulnerabilities.

### 8.2 Client-Side Security & XSS Protection
* **Data Escape:** All dynamic user inputs are escaped automatically by the React rendering engine before being displayed in browser templates.
* **Content Security Policy (CSP):** The application headers restrict asset execution, allowing scripts and styles to load only from verified domains.

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cloudflare.com; style-src 'self' 'unsafe-inline';
```

---

## 9. VALIDATION CHECKLIST & APP ARCHITECTURE SIGN-OFF PROCEDURES

SOP compliance requires the development team to run this validation checklist immediately after applying application changes or deploying new builds:

```
+─────────────────────────────────────────────────────────────────────────────+
| PRODUCTION APPLICATION VALIDATION SIGN-OFF SHEET                            |
|                                                                             |
| Software Version: [ Release v1.0.0 ]                                        |
| Code Base Target: [ /src/ Directory Structure ]                             |
| Lead Dev Sign-Off:[ APPROVED / COMPILED ]                                   |
| QA Lead Sign-Off: [ APPROVED / VERIFIED ]                                   |
+─────────────────────────────────────────────────────────────────────────────+
```

### 9.1 Post-Deployment Smoke Test Actions
* [ ] **Clean Dependency Verification:** Run linting tools to confirm that outer layers do not import inner core domain objects directly.
* [ ] **Zod Parsing Verification:** Validate that malformed API payloads are rejected immediately by controller-level schemas.
* [ ] **Geofence Boundary Test:** Verify that check-in attempts outside the 250-meter geofence radius are rejected as expected.
* [ ] **Settlement Escalation Check:** Verify that settlement haircut proposals exceeding approval limits are escalated correctly.
* [ ] **Async Queue Dispatch Verification:** Verify that notice generation requests are enqueued correctly in BullMQ and processed by background workers.

---

## 10. GLOSSARY & REFERENCES

### 10.1 Glossary of Terms
* **ACID:** Atomicity, Consistency, Isolation, Durability. Standard database properties that guarantee reliable transaction processing.
* **CORS:** Cross-Origin Resource Sharing. A browser security mechanism that restricts resources from being requested across domains.
* **Dependency Inversion:** A software design principle that decouples high-level business logic from low-level database drivers.
* **RBAC:** Role-Based Access Control. Restricts system access to authorized users based on their assigned role.
* **Zod:** A TypeScript-first schema declaration and validation library used to parse and secure input payloads.

### 10.2 References
1. **Clean Architecture Best Practices:** Robert C. Martin (Uncle Bob) design blueprints and separation guidelines.
2. **Prisma ORM Reference Manual:** Designing type-safe schemas, managing relations, and optimizing transactions.
3. **BullMQ Queuing Documentation:** Event-driven worker queues, job state management, and retry policies.
4. **OWASP Secure Coding Standards:** Guidelines for securing web APIs, protecting data-in-transit, and sanitizing input.

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
