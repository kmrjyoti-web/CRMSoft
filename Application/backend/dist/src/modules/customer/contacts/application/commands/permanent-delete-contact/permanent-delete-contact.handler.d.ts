import { ICommandHandler } from '@nestjs/cqrs';
import { PermanentDeleteContactCommand } from './permanent-delete-contact.command';
import { IContactRepository } from '../../../domain/interfaces/contact-repository.interface';
export declare class PermanentDeleteContactHandler implements ICommandHandler<PermanentDeleteContactCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IContactRepository);
    execute(command: PermanentDeleteContactCommand): Promise<void>;
}
