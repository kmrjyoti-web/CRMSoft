import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RejectRawContactCommand } from './reject-raw-contact.command';
import { IRawContactRepository } from '../../../domain/interfaces/raw-contact-repository.interface';
export declare class RejectRawContactHandler implements ICommandHandler<RejectRawContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IRawContactRepository, publisher: EventPublisher);
    execute(command: RejectRawContactCommand): Promise<void>;
}
