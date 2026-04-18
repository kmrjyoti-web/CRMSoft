import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { SoftDeleteRawContactCommand } from './soft-delete-raw-contact.command';
import { IRawContactRepository } from '../../../domain/interfaces/raw-contact-repository.interface';
export declare class SoftDeleteRawContactHandler implements ICommandHandler<SoftDeleteRawContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IRawContactRepository, publisher: EventPublisher);
    execute(command: SoftDeleteRawContactCommand): Promise<void>;
}
