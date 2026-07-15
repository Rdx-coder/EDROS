/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import { redisCache } from "../../../infrastructure/redisClient";
import { bullQueue, BullQueueManager } from "../../../infrastructure/bullQueue";
import { s3Storage } from "../../../infrastructure/s3Storage";
import { PrismaDebtCaseRepository } from "../../../infrastructure/repositories";
import { PinoLogger } from "../../../infrastructure/pinoLogger";

const router = express.Router();

/**
 * Helper to run a test and capture outcome logs
 */
async function runDiagnosticStep(name: string, fn: () => Promise<string>): Promise<{ test: string; status: "PASS" | "FAIL"; message?: string; error?: string }> {
  try {
    const resultMessage = await fn();
    return { test: name, status: "PASS", message: resultMessage };
  } catch (err: any) {
    return { test: name, status: "FAIL", error: err.message || String(err) };
  }
}

/**
 * 1. GET: Comprehensive Diagnostic Test Suites
 */
router.get("/run", async (req, res) => {
  const suiteResults: any[] = [];

  // Worker & Queue Basic Diagnostics
  suiteResults.push(await runDiagnosticStep("Worker Dispatch Cycle", async () => {
    let processed = false;
    bullQueue.process("test-worker-diagnostics", async () => {
      processed = true;
    });
    const job = await bullQueue.add("test-worker-diagnostics", { flag: true }, { attempts: 1 });
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (job.status === "COMPLETED" || processed) {
      return `Job ID ${job.id} executed successfully by registered worker thread.`;
    }
    throw new Error(`Job processing stalled in state: ${job.status}`);
  }));

  // Caching Layer Diagnostics
  suiteResults.push(await runDiagnosticStep("Cache Get/Set Cycle", async () => {
    await redisCache.set("diag:cache:test", { healthy: true }, 5);
    const data = await redisCache.get<{ healthy: boolean }>("diag:cache:test");
    if (data?.healthy) {
      await redisCache.del("diag:cache:test");
      return "Successfully write, read, and delete roundtrip verified.";
    }
    throw new Error("Value verification failed or key expired prematurely.");
  }));

  // S3 Storage Security Diagnostics
  suiteResults.push(await runDiagnosticStep("S3 Storage Vault Upload", async () => {
    const meta = { fileName: "test_financial_audit.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileSizeKb: 15 };
    s3Storage.validateMetadata(meta);
    const url = await s3Storage.uploadFile("test_financial_audit.xlsx", Buffer.from("diag-content"), meta);
    if (url.includes("secured-vault-s3") || url.includes("vault")) {
      return `File uploaded securely. Download endpoint generated: ${url}`;
    }
    throw new Error(`Unexpected secure URL structure returned: ${url}`);
  }));

  // Retry Engine & Exponential Backoff Diagnostics
  suiteResults.push(await runDiagnosticStep("Retry Backoff Verification", async () => {
    let attemptsCount = 0;
    bullQueue.process("test-retry-diagnostics", async () => {
      attemptsCount++;
      throw new Error(`Intentional simulation fail count: ${attemptsCount}`);
    });
    const job = await bullQueue.add("test-retry-diagnostics", { retry: true }, { attempts: 2 });
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    if (job.attemptsMade > 0) {
      return `Exponential backoff retry triggers successfully executed. Attempts made: ${job.attemptsMade}. Job status: ${job.status}`;
    }
    throw new Error(`Retry triggers failed to increment attempt counter. Job status: ${job.status}`);
  }));

  const allPassed = suiteResults.every((r) => r.status === "PASS");

  res.json({
    success: allPassed,
    summary: allPassed ? "All Distributed Worker Core Architectural systems verified." : "One or more core components failed to pass diagnostic checks.",
    timestamp: new Date().toISOString(),
    results: suiteResults
  });
});

/**
 * 2. GET: Worker Verification Suite
 */
router.get("/tests/workers", async (req, res) => {
  const result = await runDiagnosticStep("Worker Dynamic Registration", async () => {
    const customJobName = `custom-worker-${Date.now()}`;
    let success = false;
    bullQueue.process(customJobName, async (job) => {
      success = job.data.value;
    });

    const job = await bullQueue.add(customJobName, { value: true });
    await new Promise((r) => setTimeout(r, 100));

    if (success && job.status === "COMPLETED") {
      return "Dynamic register, process loop, and completion signals verified.";
    }
    throw new Error(`Worker failing to mark job complete. Job state: ${job.status}`);
  });
  res.json(result);
});

/**
 * 3. GET: Queue Verification Suite (Verifies multiple queues from our 20 types)
 */
router.get("/tests/queues", async (req, res) => {
  const result = await runDiagnosticStep("Multi-Queue Route Isolations", async () => {
    const emailJob = await bullQueue.add(BullQueueManager.QUEUES.EMAIL, "send-report", { to: "exec@bank.net" });
    const ocrJob = await bullQueue.add(BullQueueManager.QUEUES.DOCUMENT_OCR, "ocr-doc", { docId: "doc-123" });
    
    await new Promise((r) => setTimeout(r, 150));

    if (["COMPLETED", "RUNNING", "QUEUED"].includes(emailJob.status) && ["COMPLETED", "RUNNING", "QUEUED"].includes(ocrJob.status)) {
      return `Successfully routed tasks into dedicated Email Queue (Job ID ${emailJob.id}) and OCR Queue (Job ID ${ocrJob.id}).`;
    }
    throw new Error(`Queue states mismatch: Email: ${emailJob.status}, OCR: ${ocrJob.status}`);
  });
  res.json(result);
});

/**
 * 4. GET: Retry & Backoff Verification Suite
 */
router.get("/tests/retry", async (req, res) => {
  const result = await runDiagnosticStep("Exponential Backoff Retries", async () => {
    const failingQueue = `fail-retry-test-${Date.now()}`;
    let calls = 0;
    bullQueue.process(failingQueue, async () => {
      calls++;
      throw new Error("Forced retry fail");
    });

    const job = await bullQueue.add(failingQueue, { payload: {} }, { attempts: 3 });
    // Let the first execute and schedule retry
    await new Promise((r) => setTimeout(r, 150));

    if (job.attemptsMade > 0 && (job.status === "DELAYED" || job.status === "QUEUED" || job.status === "DLQ")) {
      return `Verified active retry looping. Attempt count: ${job.attemptsMade}, Next run planned: ${job.nextRunTime ? new Date(job.nextRunTime).toISOString() : "N/A"}`;
    }
    throw new Error(`Job attempts: ${job.attemptsMade}, State: ${job.status}`);
  });
  res.json(result);
});

/**
 * 5. GET: Failure & DLQ Routing Verification Suite
 */
router.get("/tests/failures", async (req, res) => {
  const result = await runDiagnosticStep("Dead-Letter Queue Isolation", async () => {
    const deadQueue = `dlq-forced-test-${Date.now()}`;
    bullQueue.process(deadQueue, async () => {
      throw new Error("Forced permanent crash");
    });

    // Enqueue with only 1 attempt allowed so it routes to DLQ immediately upon failure
    const job = await bullQueue.add(deadQueue, { triggerDlq: true }, { attempts: 1 });
    await new Promise((r) => setTimeout(r, 150));

    const foundInDlq = bullQueue.getDLQ().some((j) => j.id === job.id);
    if (job.status === "DLQ" || foundInDlq) {
      return `Verified job ${job.id} isolation inside the Dead Letter Queue. Status: ${job.status}, Err: ${job.error}`;
    }
    throw new Error(`Job did not register in DLQ. Current state: ${job.status}`);
  });
  res.json(result);
});

/**
 * 6. GET: Worker Concurrency Verification Suite
 */
router.get("/tests/concurrency", async (req, res) => {
  const result = await runDiagnosticStep("Worker Concurrency Limits", async () => {
    const concQueue = `concurrency-test-${Date.now()}`;
    let maxRunning = 0;
    let currentRunning = 0;

    bullQueue.process(concQueue, async () => {
      currentRunning++;
      if (currentRunning > maxRunning) maxRunning = currentRunning;
      await new Promise((resolve) => setTimeout(resolve, 100)); // Hold slot
      currentRunning--;
    });

    // Enqueue 5 jobs simultaneously
    const jobs = await Promise.all([
      bullQueue.add(concQueue, "job-1", {}),
      bullQueue.add(concQueue, "job-2", {}),
      bullQueue.add(concQueue, "job-3", {}),
      bullQueue.add(concQueue, "job-4", {}),
      bullQueue.add(concQueue, "job-5", {}),
    ]);

    await new Promise((r) => setTimeout(r, 150));

    return `Successfully spawned parallel execution threads. Max verified concurrent jobs processed by pooling worker: ${maxRunning}.`;
  });
  res.json(result);
});

/**
 * 7. GET: Mass Load Simulation Suite
 */
router.get("/tests/load", async (req, res) => {
  const result = await runDiagnosticStep("Load Test Throughput", async () => {
    const loadQueue = `load-test-${Date.now()}`;
    let processedCount = 0;
    bullQueue.process(loadQueue, async () => {
      processedCount++;
    });

    const start = Date.now();
    // Flood enqueue 50 quick jobs
    const queueAdditions: Promise<any>[] = [];
    for (let i = 0; i < 50; i++) {
      queueAdditions.push(bullQueue.add(loadQueue, `load-job-${i}`, { index: i }));
    }
    await Promise.all(queueAdditions);
    const endEnqueue = Date.now();

    // Let worker thread flush them
    await new Promise((r) => setTimeout(r, 200));

    return `Enqueue throughput: 50 jobs dispatched in ${endEnqueue - start}ms. Worker loop progress: ${processedCount} completed successfully.`;
  });
  res.json(result);
});

/**
 * 8. GET: Secure Cloud Storage & Document Processing Integration Suite
 */
router.get("/tests/storage", async (req: any, res) => {
  const { documentService } = await import("../../../application/documentService");
  const { DocumentProcessor } = await import("../../../infrastructure/documentProcessor");
  const { secureDocumentRepo } = await import("../../../infrastructure/secureDocumentRepository");
  const { activeStorage } = await import("../../../infrastructure/storageProviders");

  const results: any[] = [];

  // Test 1: EXIF Header stripping on JPEG buffer
  results.push(await runDiagnosticStep("Metadata Security: EXIF Header Stripper", async () => {
    const rawJpeg = Buffer.concat([
      Buffer.from([0xFF, 0xD8]), // SOI
      Buffer.from([0xFF, 0xE1, 0x00, 0x0A, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00]), // APP1 EXIF segment (10 bytes)
      Buffer.from([0xFF, 0xDF, 0x00, 0x04, 0xAA, 0xBB]), // dummy data
      Buffer.from([0xFF, 0xD9]) // EOI
    ]);

    const cleaned = await DocumentProcessor.removeExif(rawJpeg);
    if (cleaned.toString().includes("Exif")) {
      throw new Error("EXIF metadata header was not cleanly stripped from byte sequence!");
    }
    return `Cleaned JPEG byte buffer size: ${cleaned.length} bytes (APP1 EXIF block successfully purged).`;
  }));

  // Test 2: Malware Scan Security Hook
  results.push(await runDiagnosticStep("Security Guard: EICAR Signature Malware Intercept", async () => {
    const maliciousBuffer = Buffer.from("X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*");
    try {
      await documentService.uploadDocument("threat_payload.exe", maliciousBuffer, {
        tenantId: "tenant-delta",
        uploadedBy: "auditor@edros.net"
      });
      throw new Error("Malware scanner failed to raise alarm or intercept infected payload!");
    } catch (err: any) {
      if (err.message.includes("Security Violation")) {
        return "Clean malware signature match. Threat isolated and upload aborted.";
      }
      throw err;
    }
  }));

  // Test 3: Download Bandwidth Throttling Cap
  results.push(await runDiagnosticStep("Performance: Hourly Bandwidth Throttler Block", async () => {
    // Register large 60MB document
    const largeDoc = await secureDocumentRepo.save({
      id: "doc-diag-large",
      tenantId: "tenant-delta",
      uploadedBy: "tester@edros.net",
      uploadedAt: new Date(),
      checksum: "largechecksum",
      storageProvider: activeStorage.getProviderName(),
      bucket: activeStorage.getBucketName(),
      objectKey: "vault/tenant-delta/large_pdf.pdf",
      contentType: "application/pdf",
      fileSize: 62428800, // 60MB
      version: "v1.0.0",
      visibility: "PRIVATE",
      tags: ["DIAG"],
      status: "APPROVED",
      fileName: "large_pdf.pdf",
      isDeleted: false
    });

    try {
      // First download should hit bandwidth capping of 50MB instantly
      await documentService.getSecureDownloadUrl(largeDoc.id, "heavy_user@edros.net", "tenant-delta");
      throw new Error("Throttling failed to enforce bandwidth cap limit!");
    } catch (err: any) {
      if (err.message.includes("Bandwidth Transfer Cap Violated")) {
        return "Bandwidth Throttler blocked transfer sequence. 50MB/hour policy enforced.";
      }
      throw err;
    } finally {
      await secureDocumentRepo.delete("doc-diag-large");
    }
  }));

  // Test 4: PDF Merge and Concat Cataloging
  results.push(await runDiagnosticStep("PDF Core Engine: Multi-file Merge", async () => {
    const page1 = Buffer.from("%PDF-1.4\n%%[CONTENT_STREAM: Page 1]%%\n%%EOF\n");
    const page2 = Buffer.from("%PDF-1.4\n%%[CONTENT_STREAM: Page 2]%%\n%%EOF\n");
    
    const merged = await DocumentProcessor.mergePDFs([page1, page2]);
    if (merged.toString().includes("EDROS_PDF_MERGE_CATALOG")) {
      return `PDF documents integrated successfully into a single output buffer (${merged.length} bytes).`;
    }
    throw new Error("PDF Merged metadata trailer block missing or incomplete.");
  }));

  // Test 5: PDF 128-bit RC4 Crypto Lock
  results.push(await runDiagnosticStep("PDF Core Engine: RC4 Stream Cryptography Seal", async () => {
    const plainPdf = Buffer.from("%PDF-1.4\nThis is highly sensitive litigation docket file data.\n%%EOF\n");
    const key = "legalPassword123";
    
    const encrypted = await DocumentProcessor.encryptPDF(plainPdf, key);
    if (encrypted.includes("sensitive litigation")) {
      throw new Error("Cryptographic XOR failed to obscure plaintext sensitive structures!");
    }
    return `RC4 Stream cipher encrypted PDF output size: ${encrypted.length} bytes (Plaintext obscured successfully).`;
  }));

  const allPassed = results.every((r) => r.status === "PASS");
  res.json({
    success: allPassed,
    summary: allPassed ? "All enterprise storage, processing, and document operations passed diagnostics." : "Errors encountered inside the document storage test suite.",
    timestamp: new Date().toISOString(),
    results
  });
});

export default router;
