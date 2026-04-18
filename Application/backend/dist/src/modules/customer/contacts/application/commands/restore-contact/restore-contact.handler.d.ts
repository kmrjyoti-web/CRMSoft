import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RestoreContactCommand } from './restore-contact.command';
import { IContactRepository } from '../../../domain/interfaces/contact-repository.interface';
export declare class RestoreContactHandler implements ICommandHandler<RestoreContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IContactRepository, publisher: EventPublisher);
    execute(command: RestoreContactCommand): Promise<void>;
}
