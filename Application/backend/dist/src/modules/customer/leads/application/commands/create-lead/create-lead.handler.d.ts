import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { CreateLeadCommand } from './create-lead.command';
import { ILeadRepository } from '../../../domain/interfaces/lead-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
export declare class CreateLeadHandler implements ICommandHandler<CreateLeadCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly prisma;
    private readonly workflowEngine;
    private readonly logger;
    constructor(repo: ILeadRepository, publisher: EventPublisher, prisma: PrismaService, workflowEngine: WorkflowEngineService);
    execute(command: CreateLeadCommand): Promise<string>;
}
