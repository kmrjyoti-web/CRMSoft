import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ReopenRawContactCommand } from './reopen-raw-contact.command';
import { IRawContactRepository } from '../../../domain/interfaces/raw-contact-repository.interface';
export declare class ReopenRawContactHandler implements ICommandHandler<ReopenRawContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IRawContactRepository, publisher: EventPublisher);
    execute(command: ReopenRawContactCommand): Promise<void>;
}
