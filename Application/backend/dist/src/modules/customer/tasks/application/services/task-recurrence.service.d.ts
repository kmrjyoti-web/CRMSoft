import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { TaskRecurrence } from '@prisma/working-client';
export declare class TaskRecurrenceService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateNextDate(fromDate: Date, recurrence: TaskRecurrence): Date | null;
    processRecurringTasks(): Promise<number>;
}
