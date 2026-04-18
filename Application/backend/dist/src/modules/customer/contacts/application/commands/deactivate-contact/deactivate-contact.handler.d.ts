import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { DeactivateContactCommand } from './deactivate-contact.command';
import { IContactRepository } from '../../../domain/interfaces/contact-repository.interface';
export declare class DeactivateContactHandler implements ICommandHandler<DeactivateContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IContactRepository, publisher: EventPublisher);
    execute(command: DeactivateContactCommand): Promise<void>;
}
