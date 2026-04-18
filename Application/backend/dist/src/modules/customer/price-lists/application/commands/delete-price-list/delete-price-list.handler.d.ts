import { ICommandHandler } from '@nestjs/cqrs';
import { DeletePriceListCommand } from './delete-price-list.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class DeletePriceListHandler implements ICommandHandler<DeletePriceListCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: DeletePriceListCommand): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
