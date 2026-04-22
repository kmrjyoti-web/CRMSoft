import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface PresignedUploadUrl {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID') ?? '';
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID') ?? '';
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY') ?? '';

    this.bucket = this.config.get<string>('R2_BUCKET_NAME') ?? 'crm-screenshots';
    this.publicBase = this.config.get<string>('R2_PUBLIC_URL') ?? `https://${accountId}.r2.cloudflarestorage.com/${this.bucket}`;

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  /**
   * Generate a presigned URL for direct browser-to-R2 upload
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 300,
  ): Promise<PresignedUploadUrl> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    const publicUrl = `${this.publicBase}/${key}`;

    return { uploadUrl, publicUrl, key };
  }

  /**
   * Delete a file from R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (error: any) {
      this.logger.warn(`Failed to delete R2 object ${key}: ${error.message}`);
    }
  }

  /**
   * Generate a screenshot key: manual-tests/{tenantId}/{date}/{filename}
   */
  buildScreenshotKey(tenantId: string, filename: string): string {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `manual-tests/${tenantId}/${date}/${Date.now()}_${sanitized}`;
  }
}
