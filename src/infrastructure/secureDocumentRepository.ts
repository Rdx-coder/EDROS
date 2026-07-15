/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrismaClient } from "@prisma/client";
import { redisCache } from "./redisClient";
import { PinoLogger } from "./pinoLogger";

const prisma = new PrismaClient();

export interface SecureDocument {
  id: string;
  tenantId: string;
  caseId?: string;
  customerId?: string;
  employeeId?: string;
  uploadedBy: string;
  uploadedAt: Date;
  checksum: string;
  storageProvider: string;
  bucket: string;
  objectKey: string;
  contentType: string;
  fileSize: number; // in bytes
  version: string;
  visibility: "PRIVATE" | "INTERNAL" | "PUBLIC";
  tags: string[];
  status: "PENDING_VERIFICATION" | "VERIFIED" | "APPROVED" | "REJECTED" | "ARCHIVED";
  fileName: string;
  isDeleted: boolean;
}

export class SecureDocumentRepository {
  private fallbackDb = new Map<string, SecureDocument>();

  constructor() {
    this.seedFallback();
  }

  private seedFallback() {
    // Initial high-fidelity metadata seed matching the UI mock documents
    const initialDocs: SecureDocument[] = [
      {
        id: "doc-01",
        tenantId: "tenant-delta",
        uploadedBy: "rahul.dangi.sait@gmail.com",
        uploadedAt: new Date("2026-07-10T11:20:00.000Z"),
        checksum: "8a5c3789fdc8d23bb459a98efcc29cd01ea55757049ee14a0ff43bbd5cb3fb31",
        storageProvider: "VIRTUAL_LOCAL_DISK",
        bucket: "secured-vault-s3",
        objectKey: "vault/sec_138_demand_notice_99182.pdf",
        contentType: "application/pdf",
        fileSize: 421888,
        version: "v1.0.0",
        visibility: "PRIVATE",
        tags: ["LEGAL_NOTICE"],
        status: "APPROVED",
        fileName: "sec_138_demand_notice_99182.pdf",
        isDeleted: false
      },
      {
        id: "doc-02",
        tenantId: "tenant-delta",
        uploadedBy: "rahul.dangi.sait@gmail.com",
        uploadedAt: new Date("2026-07-12T14:45:00.000Z"),
        checksum: "7b4c921503cb82ad4e0e29ba7e21a8cd24ab8312019ee14f0ff0bbd5c5f8df2d",
        storageProvider: "VIRTUAL_LOCAL_DISK",
        bucket: "secured-vault-s3",
        objectKey: "vault/ptp_receipt_payment_5000_check.pdf",
        contentType: "application/pdf",
        fileSize: 184320,
        version: "v1.0.0",
        visibility: "PRIVATE",
        tags: ["PTP_RECEIPT"],
        status: "VERIFIED",
        fileName: "ptp_receipt_payment_5000_check.pdf",
        isDeleted: false
      },
      {
        id: "doc-03",
        tenantId: "tenant-delta",
        uploadedBy: "rahul.dangi.sait@gmail.com",
        uploadedAt: new Date("2026-07-13T09:15:00.000Z"),
        checksum: "3c98ef241da73baef53a9cd09a8eb712cd54736f890ae14a0ff1bbd5cbfa0fca",
        storageProvider: "VIRTUAL_LOCAL_DISK",
        bucket: "secured-vault-s3",
        objectKey: "vault/debtor_national_id_pan_v1.jpg",
        contentType: "image/jpeg",
        fileSize: 911360,
        version: "v1.0.0",
        visibility: "INTERNAL",
        tags: ["DEBTOR_ID"],
        status: "PENDING_VERIFICATION",
        fileName: "debtor_national_id_pan_v1.jpg",
        isDeleted: false
      }
    ];

    for (const d of initialDocs) {
      this.fallbackDb.set(d.id, d);
    }
  }

  public async save(doc: SecureDocument): Promise<SecureDocument> {
    const cacheKey = `cache:secure_doc:${doc.id}`;
    
    // Save to Postgres Prisma tables first (if database has the migrations)
    try {
      // Find or create default DocumentCategory code matches tag or category
      const catCode = doc.tags[0] || "GENERIC";
      const catName = doc.tags[0] ? `Category ${doc.tags[0]}` : "Generic Category";
      
      const category = await prisma.documentCategory.upsert({
        where: { code: catCode },
        update: {},
        create: {
          name: catName,
          code: catCode
        }
      });

      // Write metadata to DocumentMaster mapping
      await prisma.documentMaster.upsert({
        where: { id: doc.id },
        update: {
          title: doc.fileName,
          storagePath: doc.objectKey,
          fileSizeKb: Math.ceil(doc.fileSize / 1024),
          fileType: doc.contentType.split("/")[1] || "bin",
          sha256Checksum: doc.checksum,
          isDeleted: doc.isDeleted
        },
        create: {
          id: doc.id,
          categoryId: category.id,
          title: doc.fileName,
          storagePath: doc.objectKey,
          fileSizeKb: Math.ceil(doc.fileSize / 1024),
          fileType: doc.contentType.split("/")[1] || "bin",
          sha256Checksum: doc.checksum,
          uploadedById: "00000000-0000-0000-0000-000000000000", // system mock id for relations
          isDeleted: doc.isDeleted
        }
      });

      // Map Case relations if caseId is passed
      if (doc.caseId) {
        await prisma.caseDocumentMap.upsert({
          where: {
            caseId_documentId: {
              caseId: doc.caseId,
              documentId: doc.id
            }
          },
          update: {},
          create: {
            caseId: doc.caseId,
            documentId: doc.id
          }
        });
      }

      // Map Customer relations if customerId is passed
      if (doc.customerId) {
        await prisma.customerDocument.upsert({
          where: {
            customerId_documentId: {
              customerId: doc.customerId,
              documentId: doc.id
            }
          },
          update: {},
          create: {
            customerId: doc.customerId,
            documentId: doc.id
          }
        });
      }
    } catch (err) {
      PinoLogger.warn(`[Prisma Document] Failed writing metadata to PostgreSQL. Falling back to structured memory + Redis registry.`, err);
    }

    // Persist full metadata in high-speed Redis + fallback memory map
    this.fallbackDb.set(doc.id, doc);
    await redisCache.set(cacheKey, doc, 86400); // cache metadata for 24 hours
    
    // Invalidate search lists caches
    await redisCache.invalidatePattern("cache:secure_docs_search:*");
    
    PinoLogger.info(`[Secure Document Repo] Document metadata persisted successfully. ID: ${doc.id}`);
    return doc;
  }

  public async findById(id: string): Promise<SecureDocument | null> {
    const cacheKey = `cache:secure_doc:${id}`;
    const cached = await redisCache.get<SecureDocument>(cacheKey);
    if (cached) return cached;

    // Check memory store
    const doc = this.fallbackDb.get(id);
    if (doc) {
      await redisCache.set(cacheKey, doc, 86400);
      return doc;
    }

    return null;
  }

  public async search(tenantId: string, criteria: {
    caseId?: string;
    customerId?: string;
    employeeId?: string;
    tag?: string;
    searchQuery?: string;
    status?: string;
  }): Promise<SecureDocument[]> {
    const cacheKey = `cache:secure_docs_search:${tenantId}:${JSON.stringify(criteria)}`;
    const cached = await redisCache.get<SecureDocument[]>(cacheKey);
    if (cached) return cached;

    // Search active memory store
    let results = Array.from(this.fallbackDb.values()).filter(
      (d) => d.tenantId === tenantId && !d.isDeleted
    );

    if (criteria.caseId) {
      results = results.filter((d) => d.caseId === criteria.caseId);
    }
    if (criteria.customerId) {
      results = results.filter((d) => d.customerId === criteria.customerId);
    }
    if (criteria.employeeId) {
      results = results.filter((d) => d.employeeId === criteria.employeeId);
    }
    if (criteria.tag) {
      results = results.filter((d) => d.tags.includes(criteria.tag!));
    }
    if (criteria.status) {
      results = results.filter((d) => d.status === criteria.status);
    }
    if (criteria.searchQuery) {
      const q = criteria.searchQuery.toLowerCase();
      results = results.filter(
        (d) => d.fileName.toLowerCase().includes(q) || d.id.includes(q)
      );
    }

    // Sort by uploadedAt descending
    results.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    await redisCache.set(cacheKey, results, 300); // cache lists for 5 mins
    return results;
  }

  public async delete(id: string): Promise<boolean> {
    const doc = await this.findById(id);
    if (!doc) return false;

    doc.isDeleted = true;
    await this.save(doc);
    return true;
  }
}

export const secureDocumentRepo = new SecureDocumentRepository();
