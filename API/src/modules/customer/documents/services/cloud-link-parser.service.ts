import { Injectable } from '@nestjs/common';
import { StorageProvider } from '@prisma/client';

export interface CloudLinkInfo {
  provider: StorageProvider;
  fileId: string;
  fileName?: string;
  url: string;
}

@Injectable()
export class CloudLinkParserService {
  // Google Drive patterns:
  // https://drive.google.com/file/d/{fileId}/view
  // https://docs.google.com/document/d/{fileId}/edit
  // https://docs.google.com/spreadsheets/d/{fileId}/edit
  // https://docs.google.com/presentation/d/{fileId}/edit
  private readonly googleDrivePatterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/,
    /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
    /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/,
  ];

  // OneDrive patterns:
  // https://onedrive.live.com/?id={fileId}
  // https://{tenant}-my.sharepoint.com/:x:/p/{path}
  // https://1drv.ms/{shortCode}
  private readonly oneDrivePatterns = [
    /onedrive\.live\.com\/.*[?&]id=([a-zA-Z0-9!%_-]+)/,
    /1drv\.ms\/([a-zA-Z0-9_-]+)/,
    /sharepoint\.com\/:([a-z]):\//,
  ];

  // Dropbox patterns:
  // https://www.dropbox.com/s/{fileId}/{fileName}
  // https://www.dropbox.com/scl/fi/{fileId}/{fileName}
  private readonly dropboxPatterns = [
    /dropbox\.com\/s\/([a-zA-Z0-9]+)\/([^?]+)/,
    /dropbox\.com\/scl\/fi\/([a-zA-Z0-9]+)\/([^?]+)/,
  ];

  parseUrl(url: string): CloudLinkInfo | null {
    // Try Google Drive
    for (const pattern of this.googleDrivePatterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          provider: StorageProvider.GOOGLE_DRIVE,
          fileId: match[1],
          url,
        };
      }
    }

    // Try OneDrive
    for (const pattern of this.oneDrivePatterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          provider: StorageProvider.ONEDRIVE,
          fileId: match[1],
          url,
        };
      }
    }

    // Try Dropbox
    for (const pattern of this.dropboxPatterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          provider: StorageProvider.DROPBOX,
          fileId: match[1],
          fileName: match[2] ? decodeURIComponent(match[2]) : undefined,
          url,
        };
      }
    }

    return null;
  }

  detectProvider(url: string): StorageProvider | null {
    if (/google\.com|googleapis\.com/.test(url)) return StorageProvider.GOOGLE_DRIVE;
    if (/onedrive|sharepoint|1drv\.ms/.test(url)) return StorageProvider.ONEDRIVE;
    if (/dropbox\.com/.test(url)) return StorageProvider.DROPBOX;
    return null;
  }

  isCloudUrl(url: string): boolean {
    return this.detectProvider(url) !== null;
  }

  getMimeTypeFromExtension(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      jpg: 'image/jpeg', jpeg: 'image/jpeg',
      png: 'image/png', gif: 'image/gif', webp: 'image/webp',
      mp4: 'video/mp4', mp3: 'audio/mpeg',
      txt: 'text/plain', csv: 'text/csv',
      zip: 'application/zip',
    };
    return mimeMap[ext || ''] || 'application/octet-stream';
  }
}
