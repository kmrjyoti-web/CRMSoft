import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { QuickCreateLeadCommand } from './quick-create-lead.command';
import { LeadEntity } from '../../../domain/entities/lead.entity';
import {
  ILeadRepository, LEAD_REPOSITORY,
} from '../../../domain/interfaces/lead-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';

/**
 * Quick-Create Lead: atomically creates Contact + Organization + RawContact +
 * Communication + Lead in a single transaction.
 *
 * Inline-created Contact and Organization are marked with dataStatus = INCOMPLETE_DATA.
 * A corresponding RawContact record is also created for the audit trail.
 */
@CommandHandler(QuickCreateLeadCommand)
export class QuickCreateLeadHandler implements ICommandHandler<QuickCreateLeadCommand> {
  private readonly logger = new Logger(QuickCreateLeadHandler.name);

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: ILeadRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
    private readonly workflowEngine: WorkflowEngineService,
  ) {}

  async execute(command: QuickCreateLeadCommand): Promise<{
    leadId: string;
    contactId: string;
    organizationId?: string;
    rawContactId?: string;
  }> {
    // Validate: must have either contactId or inlineContact
    if (!command.contactId && !command.inlineContact) {
      throw new BadRequestException('Either contactId or inlineContact is required');
    }

    // If using existing contactId, validate it exists
    if (command.contactId && !command.inlineContact) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: command.contactId },
        select: { id: true, isActive: true },
      });
      if (!contact) throw new NotFoundException(`Contact ${command.contactId} not found`);
      if (!contact.isActive) throw new BadRequestException('Cannot create lead for deactivated contact');
    }

    // If using existing organizationId, validate it exists
    if (command.organizationId && !command.inlineOrganization) {
      const org = await this.prisma.organization.findUnique({
        where: { id: command.organizationId },
        select: { id: true },
      });
      if (!org) throw new NotFoundException(`Organization ${command.organizationId} not found`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      let orgId = command.organizationId;
      let contactId = command.contactId;
      let rawContactId: string | undefined;

      // ── 1. Organization (inline creation) ──────────────────
      if (command.inlineOrganization) {
        const orgName = command.inlineOrganization.name.trim();

        // Check if org with same name already exists
        const existing = await tx.organization.findFirst({
          where: { name: orgName },
          select: { id: true },
        });

        if (existing) {
          orgId = existing.id;
        } else {
          const newOrg = await tx.organization.create({
            data: {
              id: randomUUID(),
              name: orgName,
              dataStatus: 'INCOMPLETE_DATA',
              createdById: command.createdById,
            },
          });
          orgId = newOrg.id;
        }
      }

      // ── 2. Contact (inline creation) ───────────────────────
      if (command.inlineContact) {
        // Create Contact with INCOMPLETE_DATA status
        const newContact = await tx.contact.create({
          data: {
            id: randomUUID(),
            firstName: command.inlineContact.firstName.trim(),
            lastName: command.inlineContact.lastName.trim(),
            organizationId: orgId || null,
            dataStatus: 'INCOMPLETE_DATA',
            createdById: command.createdById,
          },
        });
        contactId = newContact.id;

        // Create Communication for Contact (MOBILE)
        await tx.communication.create({
          data: {
            id: randomUUID(),
            type: 'MOBILE',
            value: command.inlineContact.mobile.trim(),
            priorityType: 'PRIMARY',
            isPrimary: true,
            contactId: newContact.id,
          },
        });

        // Create ContactOrganization junction if org exists
        if (orgId) {
          await tx.contactOrganization.create({
            data: {
              id: randomUUID(),
              contactId: newContact.id,
              organizationId: orgId,
              relationType: 'EMPLOYEE',
            },
          });
        }

        // Create RawContact record for audit trail
        const rawContact = await tx.rawContact.create({
          data: {
            id: randomUUID(),
            firstName: command.inlineContact.firstName.trim(),
            lastName: command.inlineContact.lastName.trim(),
            companyName: command.inlineOrganization?.name?.trim() || null,
            source: 'MANUAL',
            status: 'RAW',
            contactId: newContact.id,
            createdById: command.createdById,
          },
        });
        rawContactId = rawContact.id;

        // Create Communication for RawContact (MOBILE)
        await tx.communication.create({
          data: {
            id: randomUUID(),
            type: 'MOBILE',
            value: command.inlineContact.mobile.trim(),
            priorityType: 'PRIMARY',
            isPrimary: true,
            rawContactId: rawContact.id,
          },
        });
      }

      // ── 3. Lead ────────────────────────────────────────────
      const leadNumber = await this.repo.nextLeadNumber(tx);

      const lead = LeadEntity.create(randomUUID(), {
        leadNumber,
        contactId: contactId!,
        organizationId: orgId,
        priority: command.priority || 'MEDIUM',
        expectedValue: command.expectedValue,
        expectedCloseDate: command.expectedCloseDate,
        notes: command.notes,
        createdById: command.createdById,
      });

      await this.repo.save(lead, tx);

      // Create filter associations
      if (command.filterIds?.length) {
        await tx.leadFilter.createMany({
          data: command.filterIds.map(fid => ({
            leadId: lead.id,
            lookupValueId: fid,
          })),
          skipDuplicates: true,
        });
      }

      return {
        lead,
        contactId: contactId!,
        organizationId: orgId,
        rawContactId,
      };
    });

    // Publish events after transaction succeeds
    const withEvents = this.publisher.mergeObjectContext(result.lead);
    withEvents.commit();

    this.logger.log(
      `Quick-created lead ${result.lead.leadNumber}` +
      (command.inlineContact ? ` with inline contact ${result.contactId}` : '') +
      (command.inlineOrganization ? ` and inline org ${result.organizationId}` : ''),
    );

    // Auto-initialize workflow instance (best-effort)
    try {
      await this.workflowEngine.initializeWorkflow('LEAD', result.lead.id, command.createdById);
    } catch (e) {
      this.logger.warn(`Workflow init skipped for lead ${result.lead.id}: ${(e as Error).message}`);
    }

    return {
      leadId: result.lead.id,
      contactId: result.contactId,
      organizationId: result.organizationId,
      rawContactId: result.rawContactId,
    };
  }
}
