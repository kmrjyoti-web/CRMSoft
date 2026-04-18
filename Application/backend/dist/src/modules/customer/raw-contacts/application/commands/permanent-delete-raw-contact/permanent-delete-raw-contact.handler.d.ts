import { ICommandHandler } from '@nestjs/cqrs';
import { PermanentDeleteRawContactCommand } from './permanent-delete-raw-contact.command';
import { IRawContactRepository } from '../../../domain/interfaces/raw-contact-repository.interface';
export declare class PermanentDeleteRawContactHandler implements ICommandHandler<PermanentDeleteRawContactCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IRawContactRepository);
    execute(command: PermanentDeleteRawContactCommand): Promise<void>;
}
