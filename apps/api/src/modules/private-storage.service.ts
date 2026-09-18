import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Client } from "minio";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";

/** Object keys never leave this adapter or database entities. */
@Injectable()
export class PrivateStorageService implements OnModuleInit {
  private readonly bucket = process.env.MINIO_BUCKET ?? "internhub-private";
  private readonly client = new Client({
    endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: Number(process.env.MINIO_PORT ?? 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
  });
  async onModuleInit() {
    try {
      if (!(await this.client.bucketExists(this.bucket)))
        await this.client.makeBucket(this.bucket);
    } catch {
      new Logger("PrivateStorage").warn("Storage unavailable at startup");
    }
  }
  async ready() {
    try {
      return await this.client.bucketExists(this.bucket);
    } catch {
      return false;
    }
  }
  put(key: string, bytes: Buffer, contentType: string) {
    return this.client.putObject(this.bucket, key, bytes, bytes.length, {
      "Content-Type": contentType,
    });
  }
  /** Keeps the browser out of object storage while avoiding an API memory-sized buffer. */
  putStream(key: string, stream: Readable, size: number, contentType: string) {
    return this.client.putObject(this.bucket, key, stream, size, {
      "Content-Type": contentType,
    });
  }
  async get(key: string): Promise<Readable> {
    return this.client.getObject(
      this.bucket,
      key,
    ) as unknown as Promise<Readable>;
  }
  stat(key: string) {
    return this.client.statObject(this.bucket, key);
  }
  remove(key: string) {
    return this.client.removeObject(this.bucket, key);
  }
  async verify(key: string) {
    const stream = await this.get(key);
    const hash = createHash("sha256");
    const first: Buffer[] = [];
    let firstSize = 0;
    let size = 0;
    for await (const chunk of stream) {
      const bytes = Buffer.from(chunk);
      size += bytes.length;
      hash.update(bytes);
      if (firstSize < 8) {
        const head = bytes.subarray(0, 8 - firstSize);
        first.push(head);
        firstSize += head.length;
      }
    }
    return {
      size,
      sha256: hash.digest("hex"),
      signature: Buffer.concat(first),
    };
  }
}
