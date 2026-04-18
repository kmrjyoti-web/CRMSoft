import { PrismaService } from '../prisma/prisma.service';
export declare class SlaMonitorService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    checkSlaBreaches(): Promise<void>;
    private processInstance;
    private findEscalationTarget;
    resolveEscalations(instanceId: string, stateId: string): Promise<void>;
}
