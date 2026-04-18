import { ICommandHandler } from '@nestjs/cqrs';
import { BulkTransferCommand } from './bulk-transfer.command';
import { OwnershipCoreService } from '../../../services/ownership-core.service';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class BulkTransferHandler implements ICommandHandler<BulkTransferCommand> {
    private readonly ownershipCore;
    private readonly prisma;
    constructor(ownershipCore: OwnershipCoreService, prisma: PrismaService);
    execute(command: BulkTransferCommand): Promise<{
        transferred: number;
        byType: Record<string, number>;
        failed: number;
        total: number;
    }>;
}
