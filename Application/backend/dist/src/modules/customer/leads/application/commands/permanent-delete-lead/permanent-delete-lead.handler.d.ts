import { ICommandHandler } from '@nestjs/cqrs';
import { PermanentDeleteLeadCommand } from './permanent-delete-lead.command';
import { ILeadRepository } from '../../../domain/interfaces/lead-repository.interface';
export declare class PermanentDeleteLeadHandler implements ICommandHandler<PermanentDeleteLeadCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ILeadRepository);
    execute(command: PermanentDeleteLeadCommand): Promise<void>;
}
