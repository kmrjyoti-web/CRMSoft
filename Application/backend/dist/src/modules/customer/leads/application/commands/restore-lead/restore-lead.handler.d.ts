import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RestoreLeadCommand } from './restore-lead.command';
import { ILeadRepository } from '../../../domain/interfaces/lead-repository.interface';
export declare class RestoreLeadHandler implements ICommandHandler<RestoreLeadCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: ILeadRepository, publisher: EventPublisher);
    execute(command: RestoreLeadCommand): Promise<void>;
}
