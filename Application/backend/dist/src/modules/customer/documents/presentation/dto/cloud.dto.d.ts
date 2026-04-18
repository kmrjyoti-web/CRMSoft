import { StorageProvider, DocumentCategory } from '@prisma/working-client';
export declare class ConnectCloudDto {
    provider: StorageProvider;
    accessToken: string;
    refreshToken?: string;
    tokenExpiry?: string;
    accountEmail?: string;
    accountName?: string;
}
export declare class LinkCloudFileDto {
    url: string;
    category?: DocumentCategory;
    description?: string;
    tags?: string[];
    folderId?: string;
}
