import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { EmailFooterTemplate } from '@prisma/working-client';
export declare class EmailFooterService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    list(tenantId: string): Promise<EmailFooterTemplate[]>;
    create(tenantId: string, data: {
        name: string;
        bodyHtml: string;
        isDefault?: boolean;
    }): Promise<EmailFooterTemplate>;
    update(tenantId: string, id: string, data: Partial<EmailFooterTemplate>): Promise<EmailFooterTemplate>;
    getDefault(tenantId: string): Promise<EmailFooterTemplate | null>;
}
