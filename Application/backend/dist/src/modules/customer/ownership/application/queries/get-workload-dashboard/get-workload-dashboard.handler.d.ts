import { IQueryHandler } from '@nestjs/cqrs';
import { GetWorkloadDashboardQuery } from './get-workload-dashboard.query';
import { WorkloadService } from '../../../services/workload.service';
export declare class GetWorkloadDashboardHandler implements IQueryHandler<GetWorkloadDashboardQuery> {
    private readonly workload;
    private readonly logger;
    constructor(workload: WorkloadService);
    execute(query: GetWorkloadDashboardQuery): Promise<{
        users: {
            userId: string;
            name: string;
            email: string;
            avatar: string | null;
            capacity: {
                maxLeads: number;
                maxContacts: number;
                maxOrganizations: number;
                maxQuotations: number;
                maxTotal: number;
            };
            current: {
                leads: number;
                contacts: number;
                organizations: number;
                quotations: number;
                total: number;
            };
            loadPercent: number;
            isAvailable: boolean;
            status: string;
            lastActivityAt: Date | null;
        }[];
        summary: {
            totalUsers: number;
            availableUsers: number;
            avgLoad: number;
            overloaded: number;
            underutilized: number;
        };
    }>;
}
