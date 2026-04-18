export interface UploadResult {
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    storagePath: string;
}
export declare class StorageLocalService {
    private readonly uploadDir;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    constructor();
    saveFile(file: Express.Multer.File): Promise<UploadResult>;
    deleteFile(storagePath: string): Promise<void>;
    getFile(storagePath: string): Promise<{
        buffer: Buffer;
        fileName: string;
    }>;
    getFullPath(storagePath: string): string;
    private validateFile;
    private ensureDirectory;
}
