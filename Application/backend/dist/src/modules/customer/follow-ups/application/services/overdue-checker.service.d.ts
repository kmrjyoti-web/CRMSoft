import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class OverdueCheckerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    checkOverdueFollowUps(): Promise<void>;
}
