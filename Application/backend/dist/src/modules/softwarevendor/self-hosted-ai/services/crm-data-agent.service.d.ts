import { PrismaService } from '../../../../core/prisma/prisma.service';
interface QueryResult {
    intent: string;
    data: string;
    recordCount: number;
}
export declare class CrmDataAgentService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    queryLiveData(tenantId: string, message: string): Promise<QueryResult | null>;
    private matchesStock;
    private matchesProduct;
    private matchesInventoryDashboard;
    private matchesContact;
    private matchesOrganization;
    private matchesLead;
    private matchesInvoice;
    private matchesQuotation;
    private matchesActivity;
    private matchesDashboardSummary;
    private queryStock;
    private queryProducts;
    private queryInventoryDashboard;
    private queryContacts;
    private queryOrganizations;
    private queryLeads;
    private queryInvoices;
    private queryQuotations;
    private queryActivities;
    private queryDashboardSummary;
}
export {};
