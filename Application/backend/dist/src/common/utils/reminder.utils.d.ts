import { PrismaService } from '../../core/prisma/prisma.service';
interface CreateReminderParams {
    entityType: string;
    entityId: string;
    eventDate: Date;
    title: string;
    recipientId: string;
    createdById: string;
    channels?: string[];
    minutesBefore?: number;
}
export declare function createAutoReminder(prisma: PrismaService, params: CreateReminderParams): Promise<void>;
export {};
