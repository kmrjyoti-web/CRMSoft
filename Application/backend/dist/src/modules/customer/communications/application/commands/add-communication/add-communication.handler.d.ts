import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { AddCommunicationCommand } from './add-communication.command';
import { ICommunicationRepository } from '../../../domain/interfaces/communication-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class AddCommunicationHandler implements ICommandHandler<AddCommunicationCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly prisma;
    private readonly logger;
    constructor(repo: ICommunicationRepository, publisher: EventPublisher, prisma: PrismaService);
    execute(command: AddCommunicationCommand): Promise<string>;
    private unsetExistingPrimary;
}
