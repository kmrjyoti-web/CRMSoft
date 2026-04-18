import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class TrackingService {
    private readonly prisma;
    private readonly baseUrl;
    constructor(prisma: PrismaService);
    generateTrackingPixelId(): string;
    injectOpenPixel(bodyHtml: string, trackingPixelId: string): string;
    rewriteLinks(bodyHtml: string, emailId: string): string;
    recordOpen(trackingPixelId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    recordClick(emailId: string, originalUrl: string, ipAddress?: string, userAgent?: string): Promise<string>;
    recordBounce(emailId: string, reason: string): Promise<void>;
    getTransparentPixel(): Buffer;
    private detectDeviceType;
}
