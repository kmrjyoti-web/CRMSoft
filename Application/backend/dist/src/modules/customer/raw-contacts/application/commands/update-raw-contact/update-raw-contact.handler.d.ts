import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { UpdateRawContactCommand } from './update-raw-contact.command';
import { IRawContactRepository } from '../../../domain/interfaces/raw-contact-repository.interface';
export declare class UpdateRawContactHandler implements ICommandHandler<UpdateRawContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IRawContactRepository, publisher: EventPublisher);
    execute(command: UpdateRawContactCommand): Promise<void>;
}
