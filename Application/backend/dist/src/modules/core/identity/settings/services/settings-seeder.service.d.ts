import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class SettingsSeederService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    seedAll(tenantId: string, companyName: string): Promise<void>;
    private seedBranding;
    private seedBusinessHours;
    private seedHolidays;
    private seedAutoNumbers;
    private seedCompanyProfile;
    private seedNotifPrefs;
    private seedSecurityPolicy;
    private seedRetention;
    private seedEmailFooter;
}
