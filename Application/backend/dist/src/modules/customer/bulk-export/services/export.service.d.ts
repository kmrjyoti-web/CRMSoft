import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ExportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createExport(params: {
        targetEntity: string;
        format: string;
        filters?: Record<string, unknown>;
        columns?: string[];
        createdById: string;
        createdByName: string;
    }): Promise<Record<string, unknown>>;
    private generateExportFile;
    private queryRecords;
    private extractExportValue;
    generateTemplate(entityType: string): Promise<Buffer>;
}
