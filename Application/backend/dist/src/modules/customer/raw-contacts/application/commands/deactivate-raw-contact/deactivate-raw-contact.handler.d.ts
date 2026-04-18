import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { DeactivateRawContactCommand } from './deactivate-raw-contact.command';
import { IRawContactRepository } from '../../../domain/interfaces/raw-contact-repository.interface';
export declare class DeactivateRawContactHandler implements ICommandHandler<DeactivateRawContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IRawContactRepository, publisher: EventPublisher);
    execute(command: DeactivateRawContactCommand): Promise<void>;
}
