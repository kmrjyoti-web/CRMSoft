import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DelegationService } from './delegation.service';
import { OwnershipCoreService } from './ownership-core.service';
import { WorkloadService } from './workload.service';
export declare class OwnershipCronService {
    private readonly prisma;
    private readonly delegation;
    private readonly ownershipCore;
    private readonly workload;
    private readonly logger;
    constructor(prisma: PrismaService, delegation: DelegationService, ownershipCore: OwnershipCoreService, workload: WorkloadService);
    autoRevertDelegations(): Promise<void>;
    escalateUnattended(): Promise<void>;
    expireTimeLimitedOwnership(): Promise<void>;
    recalculateAllCounts(): Promise<void>;
    private getCapacityField;
}
