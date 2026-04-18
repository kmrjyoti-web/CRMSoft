import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ReactivateRawContactCommand } from './reactivate-raw-contact.command';
import { IRawContactRepository } from '../../../domain/interfaces/raw-contact-repository.interface';
export declare class ReactivateRawContactHandler implements ICommandHandler<ReactivateRawContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IRawContactRepository, publisher: EventPublisher);
    execute(command: ReactivateRawContactCommand): Promise<void>;
}
