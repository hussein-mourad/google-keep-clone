import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "./env";

export interface StorageProvider {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<void>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string): Promise<string>;
}

class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: env.S3_REGION!,
      endpoint: env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    });
    this.bucket = env.S3_BUCKET!;
  }

  async upload(key: string, buffer: Buffer, mimeType: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
  }

  async delete(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }
}

let storage: StorageProvider | null = null;

function isS3Configured(): boolean {
  return !!(env.S3_BUCKET && env.S3_REGION && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY);
}

export function getStorage(): StorageProvider | null {
  if (!isS3Configured()) return null;
  if (!storage) {
    storage = new S3StorageProvider();
  }
  return storage;
}

export function generateImageKey(userId: string, noteId: number, filename: string): string {
  const ext = filename.split(".").pop() || "bin";
  const uuid = crypto.randomUUID();
  return `${userId}/${noteId}/${uuid}.${ext}`;
}
