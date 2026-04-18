import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ReactivateLeadCommand } from './reactivate-lead.command';
import { ILeadRepository } from '../../../domain/interfaces/lead-repository.interface';
export declare class ReactivateLeadHandler implements ICommandHandler<ReactivateLeadCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: ILeadRepository, publisher: EventPublisher);
    execute(command: ReactivateLeadCommand): Promise<void>;
}
