import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class WaApiService {
    private readonly httpService;
    private readonly prisma;
    private readonly logger;
    constructor(httpService: HttpService, prisma: PrismaService);
    private getConfig;
    private baseUrl;
    sendText(wabaId: string, to: string, text: string): Promise<any>;
    sendTemplate(wabaId: string, to: string, templateName: string, language: string, components?: Record<string, unknown>[]): Promise<any>;
    sendMedia(wabaId: string, to: string, type: string, mediaUrl: string, caption?: string): Promise<any>;
    sendInteractive(wabaId: string, to: string, interactiveType: string, interactiveData: any): Promise<any>;
    sendLocation(wabaId: string, to: string, latitude: number, longitude: number, name?: string, address?: string): Promise<any>;
    markAsRead(wabaId: string, waMessageId: string): Promise<void>;
    uploadMedia(wabaId: string, filePath: string, mimeType: string): Promise<string>;
    downloadMedia(wabaId: string, mediaId: string): Promise<Buffer>;
    getTemplates(wabaId: string): Promise<any[]>;
    createTemplate(wabaId: string, templateData: any): Promise<any>;
    deleteTemplate(wabaId: string, templateName: string): Promise<void>;
}
