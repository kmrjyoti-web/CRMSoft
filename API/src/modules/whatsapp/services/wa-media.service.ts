import { Injectable, Logger } from '@nestjs/common';
import { WaApiService } from './wa-api.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WaMediaService {
  private readonly logger = new Logger(WaMediaService.name);
  private readonly uploadDir: string;

  constructor(private readonly waApiService: WaApiService) {
    this.uploadDir = process.env.WA_MEDIA_UPLOAD_DIR || './uploads/whatsapp';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadToMeta(wabaId: string, filePath: string, mimeType: string): Promise<string> {
    return this.waApiService.uploadMedia(wabaId, filePath, mimeType);
  }

  async downloadAndSave(wabaId: string, mediaId: string, fileName: string): Promise<string> {
    const buffer = await this.waApiService.downloadMedia(wabaId, mediaId);
    const savePath = path.join(this.uploadDir, `${Date.now()}_${fileName}`);
    fs.writeFileSync(savePath, buffer);
    return savePath;
  }

  getMediaUrl(savedPath: string): string {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const relativePath = savedPath.replace('./uploads/', '');
    return `${baseUrl}/uploads/${relativePath}`;
  }
}
