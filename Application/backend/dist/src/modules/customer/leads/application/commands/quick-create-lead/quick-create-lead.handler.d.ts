import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { QuickCreateLeadCommand } from './quick-create-lead.command';
import { ILeadRepository } from '../../../domain/interfaces/lead-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
export declare class QuickCreateLeadHandler implements ICommandHandler<QuickCreateLeadCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly prisma;
    private readonly workflowEngine;
    private readonly logger;
    constructor(repo: ILeadRepository, publisher: EventPublisher, prisma: PrismaService, workflowEngine: WorkflowEngineService);
    execute(command: QuickCreateLeadCommand): Promise<{
        leadId: string;
        contactId: string;
        organizationId?: string;
        rawContactId?: string;
    }>;
}
