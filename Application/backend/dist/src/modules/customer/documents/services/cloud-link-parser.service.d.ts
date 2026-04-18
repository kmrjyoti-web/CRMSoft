import { StorageProvider } from '@prisma/working-client';
export interface CloudLinkInfo {
    provider: StorageProvider;
    fileId: string;
    fileName?: string;
    url: string;
}
export declare class CloudLinkParserService {
    private readonly googleDrivePatterns;
    private readonly oneDrivePatterns;
    private readonly dropboxPatterns;
    parseUrl(url: string): CloudLinkInfo | null;
    detectProvider(url: string): StorageProvider | null;
    isCloudUrl(url: string): boolean;
    getMimeTypeFromExtension(fileName: string): string;
}
