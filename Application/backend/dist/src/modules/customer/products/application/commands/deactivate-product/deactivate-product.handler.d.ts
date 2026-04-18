import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { DeactivateProductCommand } from './deactivate-product.command';
export declare class DeactivateProductHandler implements ICommandHandler<DeactivateProductCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: DeactivateProductCommand): Promise<{
        id: string;
        deactivated: boolean;
    }>;
}
