import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { SoftDeleteContactCommand } from './soft-delete-contact.command';
import { IContactRepository } from '../../../domain/interfaces/contact-repository.interface';
export declare class SoftDeleteContactHandler implements ICommandHandler<SoftDeleteContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IContactRepository, publisher: EventPublisher);
    execute(command: SoftDeleteContactCommand): Promise<void>;
}
