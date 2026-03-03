import { Injectable, BadRequestException } from '@nestjs/common';
import { StorageProvider } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface CloudFileMetadata {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  webViewUrl: string;
  thumbnailUrl?: string;
  lastModified?: Date;
}

@Injectable()
export class CloudProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async getFileMetadata(
    userId: string,
    provider: StorageProvider,
    fileId: string,
  ): Promise<CloudFileMetadata> {
    const connection = await this.getConnection(userId, provider);
    if (!connection) {
      throw new BadRequestException(`No active ${provider} connection found. Please connect first.`);
    }

    switch (provider) {
      case StorageProvider.GOOGLE_DRIVE:
        return this.getGoogleDriveMetadata(connection.accessToken, fileId);
      case StorageProvider.ONEDRIVE:
        return this.getOneDriveMetadata(connection.accessToken, fileId);
      case StorageProvider.DROPBOX:
        return this.getDropboxMetadata(connection.accessToken, fileId);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  async connectProvider(
    userId: string,
    provider: StorageProvider,
    accessToken: string,
    refreshToken?: string,
    tokenExpiry?: Date,
    accountEmail?: string,
    accountName?: string,
  ) {
    const existing = await this.prisma.cloudConnection.findFirst({
      where: { provider, userId },
    });

    if (existing) {
      return this.prisma.cloudConnection.update({
        where: { id: existing.id },
        data: {
          accessToken,
          refreshToken,
          tokenExpiry,
          accountEmail,
          accountName,
          status: 'CONNECTED',
          lastSyncAt: new Date(),
        },
      });
    } else {
      return this.prisma.cloudConnection.create({
        data: {
          provider,
          userId,
          accessToken,
          refreshToken,
          tokenExpiry,
          accountEmail,
          accountName,
          status: 'CONNECTED',
        },
      });
    }
  }

  async disconnectProvider(userId: string, provider: StorageProvider) {
    return this.prisma.cloudConnection.updateMany({
      where: { userId, provider },
      data: { status: 'REVOKED', isActive: false },
    });
  }

  async getConnections(userId: string) {
    return this.prisma.cloudConnection.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        provider: true,
        accountEmail: true,
        accountName: true,
        status: true,
        lastSyncAt: true,
        createdAt: true,
      },
    });
  }

  private async getConnection(userId: string, provider: StorageProvider) {
    return this.prisma.cloudConnection.findFirst({
      where: {
        provider,
        userId,
        isActive: true,
        status: 'CONNECTED',
      },
    });
  }

  // --- Provider-specific implementations ---
  // In production these would call actual APIs; here we provide the structure

  private async getGoogleDriveMetadata(accessToken: string, fileId: string): Promise<CloudFileMetadata> {
    // In production: call https://www.googleapis.com/drive/v3/files/{fileId}
    // For now, return a structure that can be filled when OAuth is configured
    return {
      fileId,
      fileName: `google-drive-file-${fileId}`,
      mimeType: 'application/octet-stream',
      fileSize: 0,
      webViewUrl: `https://drive.google.com/file/d/${fileId}/view`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}`,
    };
  }

  private async getOneDriveMetadata(accessToken: string, fileId: string): Promise<CloudFileMetadata> {
    // In production: call Microsoft Graph API /me/drive/items/{fileId}
    return {
      fileId,
      fileName: `onedrive-file-${fileId}`,
      mimeType: 'application/octet-stream',
      fileSize: 0,
      webViewUrl: `https://onedrive.live.com/?id=${fileId}`,
    };
  }

  private async getDropboxMetadata(accessToken: string, fileId: string): Promise<CloudFileMetadata> {
    // In production: call Dropbox API /2/files/get_metadata
    return {
      fileId,
      fileName: `dropbox-file-${fileId}`,
      mimeType: 'application/octet-stream',
      fileSize: 0,
      webViewUrl: `https://www.dropbox.com/s/${fileId}`,
    };
  }
}
