import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class NotionDocsService {
    private readonly prisma;
    private readonly logger;
    private notion;
    constructor(prisma: PrismaService);
    get isConfigured(): boolean;
    publishReleaseNotes(versionId: string): Promise<string | null>;
    getStatus(): Promise<{
        configured: boolean;
        hasDatabaseId: boolean;
    }>;
}
