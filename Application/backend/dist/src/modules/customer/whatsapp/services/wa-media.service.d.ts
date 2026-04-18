import { WaApiService } from './wa-api.service';
export declare class WaMediaService {
    private readonly waApiService;
    private readonly logger;
    private readonly uploadDir;
    constructor(waApiService: WaApiService);
    uploadToMeta(wabaId: string, filePath: string, mimeType: string): Promise<string>;
    downloadAndSave(wabaId: string, mediaId: string, fileName: string): Promise<string>;
    getMediaUrl(savedPath: string): string;
}
