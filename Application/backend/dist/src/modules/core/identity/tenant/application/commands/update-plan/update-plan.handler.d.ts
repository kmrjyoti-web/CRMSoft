import { ICommandHandler } from '@nestjs/cqrs';
import { UpdatePlanCommand } from './update-plan.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class UpdatePlanHandler implements ICommandHandler<UpdatePlanCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: UpdatePlanCommand): Promise<{
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
