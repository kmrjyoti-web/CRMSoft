import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCapacityCommand } from './update-user-capacity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class UpdateUserCapacityHandler implements ICommandHandler<UpdateUserCapacityCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: UpdateUserCapacityCommand): Promise<{
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
