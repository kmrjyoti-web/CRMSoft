import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteCommunicationCommand } from './delete-communication.command';
import { ICommunicationRepository } from '../../../domain/interfaces/communication-repository.interface';
export declare class DeleteCommunicationHandler implements ICommandHandler<DeleteCommunicationCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ICommunicationRepository);
    execute(command: DeleteCommunicationCommand): Promise<void>;
}
