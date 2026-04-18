import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { MarkDuplicateCommand } from './mark-duplicate.command';
import { IRawContactRepository } from '../../../domain/interfaces/raw-contact-repository.interface';
export declare class MarkDuplicateHandler implements ICommandHandler<MarkDuplicateCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IRawContactRepository, publisher: EventPublisher);
    execute(command: MarkDuplicateCommand): Promise<void>;
}
