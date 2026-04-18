import { ICommandHandler } from '@nestjs/cqrs';
import { CreatePlanCommand } from './create-plan.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class CreatePlanHandler implements ICommandHandler<CreatePlanCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: CreatePlanCommand): Promise<{
        id: string;
        name: string;
        code: string;
        description: string | null;
        isActive: boolean;
        configJson: import("@prisma/identity-client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        currency: string;
        interval: import("@prisma/identity-client").$Enums.PlanInterval;
        price: import("@prisma/identity-client/runtime/library").Decimal;
        maxUsers: number;
        maxContacts: number;
        maxLeads: number;
        maxProducts: number;
        maxStorage: number;
        features: import("@prisma/identity-client").$Enums.FeatureFlag[];
    }>;
}
