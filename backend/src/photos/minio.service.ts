import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private bucket: string;
  private readonly logger = new Logger(MinioService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'edgs-photos');
    this.client = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get<string>('MINIO_PORT', '9000')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });

    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'eu-west-1');
        this.logger.log(`Bucket ${this.bucket} created`);
      }
    } catch (err) {
      this.logger.warn(`MinIO not available: ${err.message}`);
    }
  }

  async uploadFile(filename: string, buffer: Buffer, mimetype: string): Promise<string> {
    await this.client.putObject(this.bucket, filename, buffer, buffer.length, { 'Content-Type': mimetype });
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const protocol = useSSL ? 'https://' : 'http://';
    const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get('MINIO_PORT', '9000');
    const portSuffix = (port && port !== '80' && port !== '443') ? `:${port}` : '';
    return `${protocol}${endpoint}${portSuffix}/${this.bucket}/${filename}`;
  }

  async getPresignedUrl(filename: string): Promise<string> {
    return this.client.presignedGetObject(this.bucket, filename, 3600);
  }

  async deleteFile(filename: string): Promise<void> {
    await this.client.removeObject(this.bucket, filename);
  }
}
