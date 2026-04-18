import { ICommandHandler } from '@nestjs/cqrs';
import { MarkVerifiedCommand } from './mark-verified.command';
import { ICommunicationRepository } from '../../../domain/interfaces/communication-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class MarkVerifiedHandler implements ICommandHandler<MarkVerifiedCommand> {
    private readonly repo;
    private readonly prisma;
    private readonly logger;
    constructor(repo: ICommunicationRepository, prisma: PrismaService);
    execute(command: MarkVerifiedCommand): Promise<void>;
}
