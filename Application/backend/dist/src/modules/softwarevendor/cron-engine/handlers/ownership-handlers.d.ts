import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';
export declare class RevertDelegationsHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "REVERT_DELEGATIONS";
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class EscalateUnattendedHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "ESCALATE_UNATTENDED";
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class ExpireOwnershipHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "EXPIRE_OWNERSHIP";
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class RecalcCapacityHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "RECALC_CAPACITY";
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
