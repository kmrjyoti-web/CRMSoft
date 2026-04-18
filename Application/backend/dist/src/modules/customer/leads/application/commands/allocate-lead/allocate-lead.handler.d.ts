import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { AllocateLeadCommand } from './allocate-lead.command';
import { ILeadRepository } from '../../../domain/interfaces/lead-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class AllocateLeadHandler implements ICommandHandler<AllocateLeadCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly prisma;
    private readonly logger;
    constructor(repo: ILeadRepository, publisher: EventPublisher, prisma: PrismaService);
    execute(command: AllocateLeadCommand): Promise<void>;
}
