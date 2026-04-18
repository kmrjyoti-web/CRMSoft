import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class PaymentReminderService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    scheduleReminders(tenantId: string, invoiceId: string, dueDate: Date): Promise<void>;
    processDueReminders(tenantId: string): Promise<{
        id: string;
        level: string;
        invoiceNo: string;
        sent: boolean;
    }[]>;
    cancelReminders(tenantId: string, invoiceId: string): Promise<number>;
    getForInvoice(tenantId: string, invoiceId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        channel: string;
        level: import("@prisma/working-client").$Enums.ReminderLevel;
        invoiceId: string;
        sentAt: Date | null;
        scheduledAt: Date;
        isSent: boolean;
        responseNote: string | null;
    }[]>;
}
