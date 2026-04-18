import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ICalService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    exportToIcs(userId: string, tenantId: string, startDate: Date, endDate: Date): Promise<string>;
    importFromIcs(icsContent: string, userId: string, tenantId: string): Promise<number>;
    generateFeedToken(_userId: string, _tenantId: string): string;
    private formatDate;
    private formatDateOnly;
    private escapeIcalText;
    private unescapeIcalText;
    private extractField;
    private parseIcalDate;
    private mapStatus;
}
