import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface ActiveWarning {
    ruleId: string;
    ruleName: string;
    entity: string | null;
    level: number;
    action: string;
    message: string;
    delayMinutes?: number;
    currentValue: number;
    threshold: number;
    unit: string;
}
export interface FlushCommandInfo {
    flushId: string;
    flushType: string;
    targetEntity: string | null;
    reason: string;
    redownloadAfter: boolean;
}
export interface WarningEvaluation {
    warnings: ActiveWarning[];
    overallEnforcement: string;
    blockDelayMinutes: number | null;
    mustSyncEntities: string[];
    flushCommands: FlushCommandInfo[];
}
export declare class WarningEvaluatorService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    evaluateWarnings(userId: string, deviceId: string): Promise<WarningEvaluation>;
    private evaluateLevels;
    private getEnforcementPriority;
    private interpolateMessage;
    private getPendingFlushCommands;
}
