import { Response } from 'express';
import { ApiResponse } from '../../../../common/utils/api-response';
import { ExportService } from '../services/export.service';
import { CreateExportDto } from './dto/export.dto';
import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ExportController {
    private readonly exportService;
    private readonly prisma;
    constructor(exportService: ExportService, prisma: PrismaService);
    create(dto: CreateExportDto, user: any): Promise<ApiResponse<Record<string, unknown>>>;
    list(q: any): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        createdById: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.ExportStatus;
        filters: import("@prisma/working-client/runtime/library").JsonValue | null;
        completedAt: Date | null;
        format: string;
        recordCount: number;
        fileUrl: string | null;
        fileSize: number | null;
        targetEntity: string;
        createdByName: string;
        columns: string[];
    }[]>>;
    download(jobId: string, res: Response): Promise<void | Response<any, Record<string, any>>>;
    template(entityType: string, res: Response): Promise<void>;
}
