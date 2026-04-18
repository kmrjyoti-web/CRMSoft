import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ChangeLeadStatusCommand } from './change-lead-status.command';
import { ILeadRepository } from '../../../domain/interfaces/lead-repository.interface';
export declare class ChangeLeadStatusHandler implements ICommandHandler<ChangeLeadStatusCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: ILeadRepository, publisher: EventPublisher);
    execute(command: ChangeLeadStatusCommand): Promise<void>;
}
