import { ICommandHandler } from '@nestjs/cqrs';
import { BulkAssignCommand } from './bulk-assign.command';
import { OwnershipCoreService } from '../../../services/ownership-core.service';
export declare class BulkAssignHandler implements ICommandHandler<BulkAssignCommand> {
    private readonly ownershipCore;
    constructor(ownershipCore: OwnershipCoreService);
    execute(command: BulkAssignCommand): Promise<{
        success: number;
        failed: number;
        errors: unknown[];
        total: number;
    }>;
}
