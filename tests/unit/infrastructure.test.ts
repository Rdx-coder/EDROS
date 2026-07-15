/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from "vitest";
import { S3StorageManager } from "../../src/infrastructure/s3Storage";
import { ValidationError, ForbiddenError, NotFoundError } from "../../src/infrastructure/exceptions";
import { PinoLogger } from "../../src/infrastructure/pinoLogger";

describe("Infrastructure Unit Tests", () => {
  describe("S3StorageManager", () => {
    const s3Storage = new S3StorageManager();

    it("should accept valid file metadata profiles", () => {
      const validMeta = {
        fileName: "audit.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSizeKb: 1024,
      };

      expect(() => s3Storage.validateMetadata(validMeta)).not.toThrow();
    });

    it("should reject invalid file mime types", () => {
      const invalidMeta = {
        fileName: "script.sh",
        mimeType: "text/x-shellscript",
        fileSizeKb: 10,
      };

      expect(() => s3Storage.validateMetadata(invalidMeta)).toThrow(
        "S3 Storage Security Guard: Mime type 'text/x-shellscript' is restricted"
      );
    });

    it("should reject files exceeding the 50MB ceiling limit", () => {
      const largeMeta = {
        fileName: "movie.mp4",
        mimeType: "video/mp4",
        fileSizeKb: 60000, // 60MB
      };

      // Since video/mp4 is rejected first anyway, let's use an allowed mime type but make it huge
      const massiveMeta = {
        fileName: "big_report.pdf",
        mimeType: "application/pdf",
        fileSizeKb: 60000, // 60MB
      };

      expect(() => s3Storage.validateMetadata(massiveMeta)).toThrow(
        "S3 Storage Security Guard: File size exceeds the permitted limit"
      );
    });

    it("should scan files and identify the EICAR antivirus test signature as malicious", async () => {
      const eicarBuffer = Buffer.from("X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*");
      const result = await s3Storage.scanForViruses("eicar.com", eicarBuffer);
      expect(result).toBe(false);

      const cleanBuffer = Buffer.from("This is a clean, compliant banking report file.");
      const cleanResult = await s3Storage.scanForViruses("clean.txt", cleanBuffer);
      expect(cleanResult).toBe(true);
    });

    it("should successfully perform simulated S3 file uploads and return secure URLs", async () => {
      const cleanBuffer = Buffer.from("Healthy content");
      const meta = {
        fileName: "legal_notice.pdf",
        mimeType: "application/pdf",
        fileSizeKb: 10,
      };

      const url = await s3Storage.uploadFile("legal_notice.pdf", cleanBuffer, meta);
      expect(url).toBeDefined();
      expect(url).toContain("vault/");
    });

    it("should abort uploads and throw security violations if virus is detected", async () => {
      const infectedBuffer = Buffer.from("X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*");
      const meta = {
        fileName: "malware.exe",
        mimeType: "application/pdf", // Fake mime-type bypass attempt
        fileSizeKb: 10,
      };

      await expect(s3Storage.uploadFile("malware.exe", infectedBuffer, meta)).rejects.toThrow(
        "Security Violation: File contains malware signature"
      );
    });
  });

  describe("Custom Security & Business Exceptions", () => {
    it("should instantiate with correct HTTP status codes", () => {
      const validationErr = new ValidationError("Invalid payload format");
      expect(validationErr.statusCode).toBe(400);
      expect(validationErr.message).toBe("Invalid payload format");

      const forbiddenErr = new ForbiddenError("Insufficient role permissions");
      expect(forbiddenErr.statusCode).toBe(403);

      const notFoundErr = new NotFoundError("User not found");
      expect(notFoundErr.statusCode).toBe(404);
    });
  });

  describe("PinoLogger System integration", () => {
    it("should compile and process audit trails", () => {
      expect(() => PinoLogger.info("Testing logs in Vitest")).not.toThrow();
      expect(() => PinoLogger.warn("Testing warns in Vitest")).not.toThrow();
      expect(() => PinoLogger.error("Testing errors in Vitest", new Error("Simulated"))).not.toThrow();
    });
  });
});
