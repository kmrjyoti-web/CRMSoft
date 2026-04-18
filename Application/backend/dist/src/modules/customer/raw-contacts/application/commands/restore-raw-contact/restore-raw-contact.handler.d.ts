import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RestoreRawContactCommand } from './restore-raw-contact.command';
import { IRawContactRepository } from '../../../domain/interfaces/raw-contact-repository.interface';
export declare class RestoreRawContactHandler implements ICommandHandler<RestoreRawContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IRawContactRepository, publisher: EventPublisher);
    execute(command: RestoreRawContactCommand): Promise<void>;
}
