import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class RecurrenceGeneratorService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateOccurrences(): Promise<void>;
    private calculateNextOccurrence;
}
