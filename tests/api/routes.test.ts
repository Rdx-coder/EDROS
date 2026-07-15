/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import express from "express";
import request from "supertest";
import apiV2Router from "../../src/presentation/routes/v2/index";
import { casesDb } from "../../src/presentation/routes/v2/recovery";
import { authenticateOperator, globalErrorHandler } from "../../src/presentation/middlewares";
import { UserRole } from "../../src/types";

// Setup a clean express server instance for route integration testing
const app = express();
app.use(express.json());

// Set mock correlation identifiers and routing context
app.use((req: any, res, next) => {
  req.correlationId = "tx-api-test-123";
  next();
});

// Mount the authenticating operator and API router
app.use("/api/v2", authenticateOperator({
  findByEmail: async (email: string) => null,
  save: async (u: any) => u
}), apiV2Router);

app.use(globalErrorHandler);

describe("REST API Endpoint V2 Integration Tests", () => {
  // Save initial database state
  let initialCases: any[];

  beforeEach(() => {
    initialCases = JSON.parse(JSON.stringify(casesDb));
  });

  describe("GET /api/v2/cases (Success, Sorting, Filtering, Pagination)", () => {
    it("should retrieve cases list successfully with default pagination", async () => {
      const response = await request(app)
        .get("/api/v2/cases")
        .set("X-Operator-Email", "manager@edros.net")
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.page).toBe(1);
    });

    it("should enforce RBAC check and return 200 for allowed roles but reject disallowed roles", async () => {
      // HR role is not in recovery list, so should fail with 403
      const response = await request(app)
        .get("/api/v2/cases")
        .set("X-Operator-Email", "hr@edros.net")
        .set("Authorization", "Bearer jwt-token-edros:hr@edros.net:HR");

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("RBAC_FORBIDDEN");
    });

    it("should apply multi-parameter search & stage filtering", async () => {
      const response = await request(app)
        .get("/api/v2/cases?stage=STAGE_2_TELE_CALLING&q=Aditya")
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      expect(response.status).toBe(200);
      expect(response.body.data.every((c: any) => c.stage === "STAGE_2_TELE_CALLING")).toBe(true);
      expect(response.body.data.some((c: any) => c.debtorName.includes("Aditya"))).toBe(true);
    });

    it("should support sorting (sortBy, order)", async () => {
      const response = await request(app)
        .get("/api/v2/cases?sortBy=outstandingAmount&order=asc")
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      expect(response.status).toBe(200);
      const data = response.body.data;
      if (data.length >= 2) {
        expect(data[0].outstandingAmount).toBeLessThanOrEqual(data[1].outstandingAmount);
      }
    });

    it("should support custom pagination limit and page offsets", async () => {
      const response = await request(app)
        .get("/api/v2/cases?page=1&limit=1")
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.totalPages).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /api/v2/cases/:id", () => {
    it("should return 200 with complete timeline for valid case ID", async () => {
      const response = await request(app)
        .get("/api/v2/cases/case-001")
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe("case-001");
      expect(Array.isArray(response.body.data.timeline)).toBe(true);
    });

    it("should return 404 for nonexistent case ID", async () => {
      const response = await request(app)
        .get("/api/v2/cases/case-nonexistent")
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("NOT_FOUND");
    });
  });

  describe("POST /api/v2/cases/:id/reallocate (Validation, Concurrency, and Payload Size)", () => {
    it("should successfully reallocate case when params are valid and user is authorized", async () => {
      const response = await request(app)
        .post("/api/v2/cases/case-001/reallocate")
        .send({ executiveId: "emp-new-777" })
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("allocated successfully");
    });

    it("should reject with 400 if executiveId payload is missing", async () => {
      const response = await request(app)
        .post("/api/v2/cases/case-001/reallocate")
        .send({})
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("VALIDATION_FAILED");
    });

    it("should reject excessively large payload sizes (OWASP denial of service defense)", async () => {
      // Generate a massive dummy body of 1MB
      const massiveBody = {
        executiveId: "emp-777",
        junkData: "X".repeat(1024 * 1024)
      };

      const response = await request(app)
        .post("/api/v2/cases/case-001/reallocate")
        .send(massiveBody)
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      // Express body parser rejects payload if it is above configured limits, or returns 400 validation error
      expect([400, 413, 500]).toContain(response.status);
    });

    it("should gracefully handle concurrent updates", async () => {
      // Dispatch 3 concurrent reallocation requests on the same case file
      const req1 = request(app)
        .post("/api/v2/cases/case-001/reallocate")
        .send({ executiveId: "exec-A" })
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      const req2 = request(app)
        .post("/api/v2/cases/case-001/reallocate")
        .send({ executiveId: "exec-B" })
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      const req3 = request(app)
        .post("/api/v2/cases/case-001/reallocate")
        .send({ executiveId: "exec-C" })
        .set("Authorization", "Bearer jwt-token-edros:manager@edros.net:BRANCH_MANAGER");

      const [res1, res2, res3] = await Promise.all([req1, req2, req3]);

      // All of them should execute gracefully since in-memory is non-locking, or at least one completes without throwing 500
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res3.status).toBe(200);
    });
  });

  describe("Diagnostics Run Suite Endpoint /api/v2/testing/run", () => {
    it("should successfully execute core architectural checks and diagnostics", async () => {
      const response = await request(app)
        .get("/api/v2/testing/run");

      expect(response.status).toBe(200);
      expect(response.body.success).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
    });
  });
});
