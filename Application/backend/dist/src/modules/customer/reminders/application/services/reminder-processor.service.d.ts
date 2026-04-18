import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class ReminderProcessorService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processDueReminders(): Promise<void>;
    detectMissedReminders(): Promise<number>;
}
