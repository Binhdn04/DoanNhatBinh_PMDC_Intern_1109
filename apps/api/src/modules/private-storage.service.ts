import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import { Readable } from 'node:stream';

/** Object keys never leave this adapter or database entities. */
@Injectable()
export class PrivateStorageService implements OnModuleInit {
  private readonly bucket = process.env.MINIO_BUCKET ?? 'internhub-private';
  private readonly client = new Client({ endPoint: process.env.MINIO_ENDPOINT ?? 'localhost', port: Number(process.env.MINIO_PORT ?? 9000), useSSL: process.env.MINIO_USE_SSL === 'true', accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin', secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin' });
  async onModuleInit() { try { if (!(await this.client.bucketExists(this.bucket))) await this.client.makeBucket(this.bucket); } catch { /* storage readiness is reported by document calls/health, not startup failure */ } }
  put(key: string, bytes: Buffer, contentType: string) { return this.client.putObject(this.bucket, key, bytes, bytes.length, { 'Content-Type': contentType }); }
  async get(key: string): Promise<Readable> { return this.client.getObject(this.bucket, key) as unknown as Promise<Readable>; }
  stat(key: string) { return this.client.statObject(this.bucket, key); }
  remove(key: string) { return this.client.removeObject(this.bucket, key); }
}
