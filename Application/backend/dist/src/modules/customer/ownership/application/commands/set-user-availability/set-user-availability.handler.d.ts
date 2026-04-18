import { ICommandHandler } from '@nestjs/cqrs';
import { SetUserAvailabilityCommand } from './set-user-availability.command';
import { WorkloadService } from '../../../services/workload.service';
import { DelegationService } from '../../../services/delegation.service';
export declare class SetUserAvailabilityHandler implements ICommandHandler<SetUserAvailabilityCommand> {
    private readonly workload;
    private readonly delegation;
    private readonly logger;
    constructor(workload: WorkloadService, delegation: DelegationService);
    execute(command: SetUserAvailabilityCommand): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        maxContacts: number;
        maxLeads: number;
        userId: string;
        conversionRate: import("@prisma/identity-client/runtime/library").Decimal | null;
        maxOrganizations: number;
        maxQuotations: number;
        maxTotal: number;
        activeLeads: number;
        activeContacts: number;
        activeOrganizations: number;
        activeQuotations: number;
        activeTotal: number;
        isAvailable: boolean;
        unavailableFrom: Date | null;
        unavailableTo: Date | null;
        delegateToId: string | null;
        avgResponseHours: import("@prisma/identity-client/runtime/library").Decimal | null;
        lastActivityAt: Date | null;
    }>;
}
