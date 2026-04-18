import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ReactivateContactCommand } from './reactivate-contact.command';
import { IContactRepository } from '../../../domain/interfaces/contact-repository.interface';
export declare class ReactivateContactHandler implements ICommandHandler<ReactivateContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IContactRepository, publisher: EventPublisher);
    execute(command: ReactivateContactCommand): Promise<void>;
}
