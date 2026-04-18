"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudProviderService = void 0;
const common_1 = require("@nestjs/common");
const working_client_1 = require("@prisma/working-client");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let CloudProviderService = class CloudProviderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFileMetadata(userId, provider, fileId) {
        const connection = await this.getConnection(userId, provider);
        if (!connection) {
            throw new common_1.BadRequestException(`No active ${provider} connection found. Please connect first.`);
        }
        switch (provider) {
            case working_client_1.StorageProvider.GOOGLE_DRIVE:
                return this.getGoogleDriveMetadata(connection.accessToken, fileId);
            case working_client_1.StorageProvider.ONEDRIVE:
                return this.getOneDriveMetadata(connection.accessToken, fileId);
            case working_client_1.StorageProvider.DROPBOX:
                return this.getDropboxMetadata(connection.accessToken, fileId);
            default:
                throw new common_1.BadRequestException(`Unsupported provider: ${provider}`);
        }
    }
    async connectProvider(userId, provider, accessToken, refreshToken, tokenExpiry, accountEmail, accountName) {
        const existing = await this.prisma.working.cloudConnection.findFirst({
            where: { provider, userId },
        });
        if (existing) {
            return this.prisma.working.cloudConnection.update({
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
        }
        else {
            return this.prisma.working.cloudConnection.create({
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
    async disconnectProvider(userId, provider) {
        return this.prisma.working.cloudConnection.updateMany({
            where: { userId, provider },
            data: { status: 'REVOKED', isActive: false },
        });
    }
    async getConnections(userId) {
        return this.prisma.working.cloudConnection.findMany({
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
    async getConnection(userId, provider) {
        return this.prisma.working.cloudConnection.findFirst({
            where: {
                provider,
                userId,
                isActive: true,
                status: 'CONNECTED',
            },
        });
    }
    async getGoogleDriveMetadata(accessToken, fileId) {
        return {
            fileId,
            fileName: `google-drive-file-${fileId}`,
            mimeType: 'application/octet-stream',
            fileSize: 0,
            webViewUrl: `https://drive.google.com/file/d/${fileId}/view`,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}`,
        };
    }
    async getOneDriveMetadata(accessToken, fileId) {
        return {
            fileId,
            fileName: `onedrive-file-${fileId}`,
            mimeType: 'application/octet-stream',
            fileSize: 0,
            webViewUrl: `https://onedrive.live.com/?id=${fileId}`,
        };
    }
    async getDropboxMetadata(accessToken, fileId) {
        return {
            fileId,
            fileName: `dropbox-file-${fileId}`,
            mimeType: 'application/octet-stream',
            fileSize: 0,
            webViewUrl: `https://www.dropbox.com/s/${fileId}`,
        };
    }
};
exports.CloudProviderService = CloudProviderService;
exports.CloudProviderService = CloudProviderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CloudProviderService);
//# sourceMappingURL=cloud-provider.service.js.map