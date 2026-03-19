import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateLeadCommand } from './create-lead.command';
import { LeadEntity } from '../../../domain/entities/lead.entity';
import {
  ILeadRepository, LEAD_REPOSITORY,
} from '../../../domain/interfaces/lead-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';

/**
 * Create a new Lead for a verified Contact.
 *
 * FLOW:
 * 1. Validate contact & organization (reads — outside transaction)
 * 2. Inside a single transaction:
 *    a. Generate next lead number (atomic — no duplicate numbers)
 *    b. Persist lead entity
 *    c. Create filter associations
 * 3. Publish domain events only after the transaction succeeds
 */
@CommandHandler(CreateLeadCommand)
export class CreateLeadHandler implements ICommandHandler<CreateLeadCommand> {
  private readonly logger = new Logger(CreateLeadHandler.name);

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: ILeadRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
    private readonly workflowEngine: WorkflowEngineService,
  ) {}

  async execute(command: CreateLeadCommand): Promise<string> {
    // 1. Validate contact exists
    const contact = await this.prisma.contact.findUnique({
      where: { id: command.contactId },
      select: { id: true, isActive: true },
    });
    if (!contact) {
      throw new NotFoundException(`Contact ${command.contactId} not found`);
    }
    if (!contact.isActive) {
      throw new Error('Cannot create lead for deactivated contact');
    }

    // 2. Validate organization if provided
    if (command.organizationId) {
      const org = await this.prisma.organization.findUnique({
        where: { id: command.organizationId },
        select: { id: true },
      });
      if (!org) {
        throw new NotFoundException(`Organization ${command.organizationId} not found`);
      }
    }

    // 3. All writes inside a single transaction
    const lead = await this.prisma.$transaction(async (tx: any) => {
      // Generate next lead number atomically (prevents duplicate numbers)
      const leadNumber = await this.repo.nextLeadNumber(tx);

      // Create domain entity
      const entity = LeadEntity.create(randomUUID(), {
        leadNumber,
        contactId: command.contactId,
        organizationId: command.organizationId,
        priority: command.priority || 'MEDIUM',
        expectedValue: command.expectedValue,
        expectedCloseDate: command.expectedCloseDate,
        notes: command.notes,
        createdById: command.createdById,
      });

      // Persist lead
      await this.repo.save(entity, tx);

      // Create filter associations
      if (command.filterIds?.length) {
        await tx.leadFilter.createMany({
          data: command.filterIds.map(fid => ({
            leadId: entity.id,
            lookupValueId: fid,
          })),
          skipDuplicates: true,
        });
      }

      return entity;
    });

    // 4. Publish events only AFTER the transaction succeeds
    const withEvents = this.publisher.mergeObjectContext(lead);
    withEvents.commit();

    // 5. Auto-initialize workflow instance (best-effort)
    try {
      await this.workflowEngine.initializeWorkflow('LEAD', lead.id, command.createdById);
    } catch (e) {
      this.logger.warn(`Workflow init skipped for lead ${lead.id}: ${(e as Error).message}`);
    }

    this.logger.log(`Lead created: ${lead.leadNumber} for contact ${command.contactId}`);
    return lead.id;
  }
}
