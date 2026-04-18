import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class RoundRobinService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getNextUser(params: {
        userIds: string[];
        entityType: string;
        lastAssignedIndex: number;
        respectCapacity?: boolean;
    }): Promise<{
        userId: string;
        newIndex: number;
    }>;
    executeForRule(ruleId: string, entityType: string, entityId: string): Promise<string>;
    private getCapacityField;
}
