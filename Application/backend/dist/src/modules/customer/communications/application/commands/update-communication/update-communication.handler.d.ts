import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommunicationCommand } from './update-communication.command';
import { ICommunicationRepository } from '../../../domain/interfaces/communication-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class UpdateCommunicationHandler implements ICommandHandler<UpdateCommunicationCommand> {
    private readonly repo;
    private readonly prisma;
    private readonly logger;
    constructor(repo: ICommunicationRepository, prisma: PrismaService);
    execute(command: UpdateCommunicationCommand): Promise<void>;
}
