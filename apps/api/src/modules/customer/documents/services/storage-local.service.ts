import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
}

@Injectable()
export class StorageLocalService {
  private readonly uploadDir: string;
  private readonly maxFileSize = 50 * 1024 * 1024; // 50 MB

  private readonly allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-rar-compressed',
    'video/mp4', 'video/mpeg', 'audio/mpeg', 'audio/wav',
  ];

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), 'uploads', 'documents');
    this.ensureDirectory(this.uploadDir);
  }

  async saveFile(file: Express.Multer.File): Promise<UploadResult> {
    this.validateFile(file);

    const dateFolder = new Date().toISOString().slice(0, 7); // YYYY-MM
    const dirPath = path.join(this.uploadDir, dateFolder);
    this.ensureDirectory(dirPath);

    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    const filePath = path.join(dirPath, uniqueName);
    const relativePath = path.join('uploads', 'documents', dateFolder, uniqueName);

    fs.writeFileSync(filePath, file.buffer);

    return {
      fileName: uniqueName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      storagePath: relativePath,
    };
  }

  async deleteFile(storagePath: string): Promise<void> {
    const fullPath = path.resolve(process.cwd(), storagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async getFile(storagePath: string): Promise<{ buffer: Buffer; fileName: string }> {
    const fullPath = path.resolve(process.cwd(), storagePath);
    if (!fs.existsSync(fullPath)) {
      throw new BadRequestException('File not found on disk');
    }
    const buffer = fs.readFileSync(fullPath);
    const fileName = path.basename(storagePath);
    return { buffer, fileName };
  }

  getFullPath(storagePath: string): string {
    return path.resolve(process.cwd(), storagePath);
  }

  private validateFile(file: Express.Multer.File): void {
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds limit of ${this.maxFileSize / (1024 * 1024)} MB`);
    }
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }
  }

  private ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
