import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { SoftDeleteLeadCommand } from './soft-delete-lead.command';
import { ILeadRepository } from '../../../domain/interfaces/lead-repository.interface';
export declare class SoftDeleteLeadHandler implements ICommandHandler<SoftDeleteLeadCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: ILeadRepository, publisher: EventPublisher);
    execute(command: SoftDeleteLeadCommand): Promise<void>;
}
