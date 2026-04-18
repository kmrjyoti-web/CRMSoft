import { ICommandHandler } from '@nestjs/cqrs';
import { LinkToEntityCommand } from './link-to-entity.command';
import { ICommunicationRepository } from '../../../domain/interfaces/communication-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class LinkToEntityHandler implements ICommandHandler<LinkToEntityCommand> {
    private readonly repo;
    private readonly prisma;
    private readonly logger;
    constructor(repo: ICommunicationRepository, prisma: PrismaService);
    execute(command: LinkToEntityCommand): Promise<void>;
}
