import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ReportEngineService } from '../infrastructure/report-engine.service';
import { DailyDigestSettingsDto } from './dto/daily-digest-settings.dto';
export declare class DailyDigestController {
    private readonly reportEngine;
    private readonly prisma;
    constructor(reportEngine: ReportEngineService, prisma: PrismaService);
    getDigest(user: any): Promise<ApiResponse<import("../interfaces").ReportData>>;
    updateSettings(dto: DailyDigestSettingsDto, user: any): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        name: string;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.ScheduledReportStatus;
        timezone: string;
        filters: import("@prisma/working-client/runtime/library").JsonValue | null;
        format: import("@prisma/working-client").$Enums.ReportFormat;
        dayOfMonth: number | null;
        dayOfWeek: number | null;
        reportDefId: string;
        frequency: import("@prisma/working-client").$Enums.ReportFrequency;
        timeOfDay: string;
        recipientEmails: string[];
        recipientUserIds: string[];
        lastSentAt: Date | null;
        nextScheduledAt: Date | null;
        lastError: string | null;
        sendCount: number;
    }>>;
    private calculateNextDigestTime;
}
