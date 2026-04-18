import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { DeactivateLeadCommand } from './deactivate-lead.command';
import { ILeadRepository } from '../../../domain/interfaces/lead-repository.interface';
export declare class DeactivateLeadHandler implements ICommandHandler<DeactivateLeadCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: ILeadRepository, publisher: EventPublisher);
    execute(command: DeactivateLeadCommand): Promise<void>;
}
