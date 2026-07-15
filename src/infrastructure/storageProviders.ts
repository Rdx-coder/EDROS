/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PinoLogger } from "./pinoLogger";

export interface StorageProvider {
  uploadFile(key: string, fileBuffer: Buffer, contentType: string, metadata?: Record<string, string>): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getSignedDownloadUrl(key: string, expirySeconds?: number): Promise<string>;
  initiateMultipartUpload(key: string, contentType: string): Promise<string>;
  uploadPart(key: string, uploadId: string, partNumber: number, chunkBuffer: Buffer): Promise<string>;
  completeMultipartUpload(key: string, uploadId: string, completedParts: { ETag: string; PartNumber: number }[]): Promise<string>;
  getProviderName(): string;
  getBucketName(): string;
}

/**
 * Virtual Mock/Simulator Storage Provider for local/development fallbacks
 */
export class VirtualStorageProvider implements StorageProvider {
  private bucket: Map<string, { buffer: Buffer; contentType: string; metadata?: Record<string, string> }> = new Map();
  private activeUploads: Map<string, { key: string; parts: Map<number, string> }> = new Map();

  public async uploadFile(key: string, fileBuffer: Buffer, contentType: string, metadata?: Record<string, string>): Promise<string> {
    PinoLogger.info(`[Virtual Storage] Mock uploading file: ${key} (${fileBuffer.length} bytes)`);
    this.bucket.set(key, { buffer: fileBuffer, contentType, metadata });
    return `https://secured-vault-virtual.edros.net/${key}`;
  }

  public async deleteFile(key: string): Promise<void> {
    PinoLogger.info(`[Virtual Storage] Mock deleting file: ${key}`);
    this.bucket.delete(key);
  }

  public async getSignedDownloadUrl(key: string, expirySeconds = 900): Promise<string> {
    PinoLogger.info(`[Virtual Storage] Mock generating signed url for ${key} expiring in ${expirySeconds}s`);
    return `https://secured-vault-virtual.edros.net/downloads/${key}?sig=${Buffer.from(key + "signature").toString("hex")}&expires=${Date.now() + expirySeconds * 1000}`;
  }

  public async initiateMultipartUpload(key: string, contentType: string): Promise<string> {
    const uploadId = `v-upload-${Date.now()}`;
    this.activeUploads.set(uploadId, { key, parts: new Map() });
    PinoLogger.info(`[Virtual Storage] Initiated multipart upload for: ${key}, UploadID: ${uploadId}`);
    return uploadId;
  }

  public async uploadPart(key: string, uploadId: string, partNumber: number, chunkBuffer: Buffer): Promise<string> {
    const upload = this.activeUploads.get(uploadId);
    if (!upload) throw new Error("Multipart upload session not found");
    const etag = `etag-p-${partNumber}-${Math.random().toString(36).substr(2, 5)}`;
    upload.parts.set(partNumber, etag);
    
    // Store chunk temporarily in bucket cache
    const chunkKey = `${key}_part_${partNumber}`;
    this.bucket.set(chunkKey, { buffer: chunkBuffer, contentType: "application/octet-stream" });
    
    PinoLogger.info(`[Virtual Storage] Uploaded part ${partNumber} for upload ID: ${uploadId}, ETag: ${etag}`);
    return etag;
  }

  public async completeMultipartUpload(key: string, uploadId: string, completedParts: { ETag: string; PartNumber: number }[]): Promise<string> {
    const upload = this.activeUploads.get(uploadId);
    if (!upload) throw new Error("Multipart upload session not found");

    // Assemble parts
    const sortedParts = [...completedParts].sort((a, b) => a.PartNumber - b.PartNumber);
    const totalBuffers: Buffer[] = [];

    for (const part of sortedParts) {
      const chunkKey = `${key}_part_${part.PartNumber}`;
      const chunk = this.bucket.get(chunkKey);
      if (!chunk) throw new Error(`Missing chunk for part ${part.PartNumber}`);
      totalBuffers.push(chunk.buffer);
      this.bucket.delete(chunkKey); // clean up chunk
    }

    const fullBuffer = Buffer.concat(totalBuffers);
    this.bucket.set(key, { buffer: fullBuffer, contentType: "application/octet-stream" });
    this.activeUploads.delete(uploadId);

    PinoLogger.info(`[Virtual Storage] Successfully completed chunk-assembled multipart upload for: ${key}, Total Size: ${fullBuffer.length} bytes`);
    return `https://secured-vault-virtual.edros.net/${key}`;
  }

  public getProviderName(): string {
    return "VIRTUAL_LOCAL_DISK";
  }

  public getBucketName(): string {
    return "virtual-secured-vault";
  }

  // Backdoor to fetch original buffer for rendering mock previews
  public getFileBuffer(key: string): Buffer | null {
    const file = this.bucket.get(key);
    return file ? file.buffer : null;
  }
}

/**
 * Enterprise AWS S3 / Compatible Multi-Cloud Storage Adapter
 */
export class S3CompatibleStorageProvider implements StorageProvider {
  private s3Client: S3Client;
  private bucketName: string;
  private providerName: string;

  constructor(provider: string, config: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    accountId?: string;
  }) {
    this.providerName = provider;
    this.bucketName = config.bucket;

    let s3Config: any = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      }
    };

    // Fine-tune configuration parameters depending on the specific object storage provider type
    switch (provider.toUpperCase()) {
      case "R2":
        // Cloudflare R2 specific routing endpoint
        const accountId = config.accountId || process.env.R2_ACCOUNT_ID || "";
        s3Config.endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
        s3Config.region = "auto";
        break;
      case "MINIO":
        // MinIO requires path-style addressing and custom URL endpoint
        s3Config.endpoint = config.endpoint || process.env.MINIO_ENDPOINT || "http://localhost:9000";
        s3Config.forcePathStyle = true;
        break;
      case "SPACES":
        // DigitalOcean Spaces routing
        s3Config.endpoint = config.endpoint || `https://${config.region}.digitaloceanspaces.com`;
        break;
      case "B2":
        // Backblaze B2 routing
        s3Config.endpoint = config.endpoint || `https://s3.${config.region}.backblazeb2.com`;
        break;
      case "S3":
      default:
        // Default AWS S3 routing
        if (config.endpoint) {
          s3Config.endpoint = config.endpoint;
          s3Config.forcePathStyle = true;
        }
        break;
    }

    this.s3Client = new S3Client(s3Config);
    PinoLogger.info(`S3CompatibleStorageProvider initiated for provider: ${provider} inside region: ${s3Config.region}`);
  }

  public async uploadFile(key: string, fileBuffer: Buffer, contentType: string, metadata?: Record<string, string>): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: metadata
      })
    );
    PinoLogger.info(`[S3 Compatible] Successfully written to bucket ${this.bucketName}: ${key}`);
    return this.getPublicUrl(key);
  }

  public async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      })
    );
    PinoLogger.info(`[S3 Compatible] Deleted object ${key} from bucket ${this.bucketName}`);
  }

  public async getSignedDownloadUrl(key: string, expirySeconds = 900): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return await getSignedUrl(this.s3Client, command, { expiresIn: expirySeconds });
  }

  public async initiateMultipartUpload(key: string, contentType: string): Promise<string> {
    const response = await this.s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType
      })
    );
    if (!response.UploadId) throw new Error("S3 failed to initiate multipart upload Session");
    return response.UploadId;
  }

  public async uploadPart(key: string, uploadId: string, partNumber: number, chunkBuffer: Buffer): Promise<string> {
    const response = await this.s3Client.send(
      new UploadPartCommand({
        Bucket: this.bucketName,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: chunkBuffer
      })
    );
    if (!response.ETag) throw new Error(`S3 failed to upload part: ${partNumber}`);
    return response.ETag;
  }

  public async completeMultipartUpload(key: string, uploadId: string, completedParts: { ETag: string; PartNumber: number }[]): Promise<string> {
    await this.s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: completedParts
        }
      })
    );
    return this.getPublicUrl(key);
  }

  public getProviderName(): string {
    return this.providerName;
  }

  public getBucketName(): string {
    return this.bucketName;
  }

  private getPublicUrl(key: string): string {
    switch (this.providerName.toUpperCase()) {
      case "R2":
        return `https://${this.bucketName}.r2.cloudflarestorage.com/${key}`;
      case "SPACES":
        return `https://${this.bucketName}.${this.bucketName}.digitaloceanspaces.com/${key}`;
      case "B2":
        return `https://f000.backblazeb2.com/file/${this.bucketName}/${key}`;
      case "MINIO":
        return `http://localhost:9000/${this.bucketName}/${key}`;
      case "S3":
      default:
        return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    }
  }
}

/**
 * Storage Provider Factory - Dynamically instantiates the requested cloud adapter
 */
export function createStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || "S3";
  const bucket = process.env.STORAGE_BUCKET || "edros-secured-vault";
  const region = process.env.STORAGE_REGION || "us-east-1";
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const endpoint = process.env.STORAGE_ENDPOINT || process.env.AWS_S3_ENDPOINT;
  const accountId = process.env.STORAGE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;

  if (accessKeyId && secretAccessKey) {
    try {
      return new S3CompatibleStorageProvider(provider, {
        bucket,
        region,
        accessKeyId,
        secretAccessKey,
        endpoint,
        accountId
      });
    } catch (err) {
      PinoLogger.error(`Failed to construct S3-compatible cloud provider adapter for ${provider}. Defaulting to high-fidelity Virtual Sandbox Simulator.`, err);
    }
  }

  PinoLogger.warn("Enterprise storage access credentials are missing. Starting system on the Virtual Storage Provider Simulator.");
  return new VirtualStorageProvider();
}

export const activeStorage = createStorageProvider();
