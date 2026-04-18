import { ICommandHandler } from '@nestjs/cqrs';
import { SetPrimaryCommunicationCommand } from './set-primary.command';
import { ICommunicationRepository } from '../../../domain/interfaces/communication-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class SetPrimaryHandler implements ICommandHandler<SetPrimaryCommunicationCommand> {
    private readonly repo;
    private readonly prisma;
    private readonly logger;
    constructor(repo: ICommunicationRepository, prisma: PrismaService);
    execute(command: SetPrimaryCommunicationCommand): Promise<void>;
}
