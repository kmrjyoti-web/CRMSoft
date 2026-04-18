import { IQueryHandler } from '@nestjs/cqrs';
import { GetContactsDashboardQuery } from './get-contacts-dashboard.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetContactsDashboardHandler implements IQueryHandler<GetContactsDashboardQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetContactsDashboardQuery): Promise<{
        stats: {
            totalContacts: number;
            activeContacts: number;
            inactiveContacts: number;
            verifiedContacts: number;
            notVerifiedContacts: number;
            totalOrganizations: number;
            verifiedOrganizations: number;
            totalCustomers: number;
        };
        industryWise: {
            industry: string;
            count: number;
            percentage: number;
        }[];
        sourceWise: {
            source: import("@prisma/working-client").$Enums.RawContactSource;
            count: number;
            percentage: number;
        }[];
        verificationTrend: {
            verified: number;
            unverified: number;
            period: string;
        }[];
        departmentWise: {
            department: string;
            count: number;
        }[];
        recentContacts: {
            id: string;
            firstName: string;
            lastName: string;
            fullName: string;
            designation: string | null;
            department: string | null;
            email: string | null;
            phone: string | null;
            organizationId: string | null;
            organizationName: string | null;
            entityVerificationStatus: string;
            isActive: boolean;
            createdAt: Date;
        }[];
    }>;
}
