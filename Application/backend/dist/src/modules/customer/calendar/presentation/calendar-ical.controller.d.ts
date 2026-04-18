import { Response } from 'express';
import { ApiResponse } from '../../../../common/utils/api-response';
import { ICalService } from '../services/ical.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class CalendarICalController {
    private readonly icalService;
    private readonly prisma;
    constructor(icalService: ICalService, prisma: PrismaService);
    exportIcal(userId: string, tenantId: string, startDate: string, endDate: string, res: Response): Promise<void>;
    importIcal(userId: string, tenantId: string, body: {
        icsContent: string;
    }): Promise<ApiResponse<{
        imported: number;
    }>>;
    publicFeed(token: string, res: Response): Promise<void>;
    generateFeedToken(userId: string, tenantId: string): Promise<ApiResponse<{
        token: string;
        feedUrl: string;
    }>>;
}
