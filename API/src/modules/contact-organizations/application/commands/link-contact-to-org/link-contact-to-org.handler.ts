import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LinkContactToOrgCommand } from './link-contact-to-org.command';
import { ContactOrganizationEntity } from '../../../domain/entities/contact-organization.entity';
import {
  IContactOrgRepository, CONTACT_ORG_REPOSITORY,
} from '../../../domain/interfaces/contact-org-repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

/**
 * Link a Contact to an Organization.
 * - Validates both entities exist
 * - Prevents duplicate links
 * - If isPrimary, unsets other primary for same org
 */
@CommandHandler(LinkContactToOrgCommand)
export class LinkContactToOrgHandler implements ICommandHandler<LinkContactToOrgCommand> {
  private readonly logger = new Logger(LinkContactToOrgHandler.name);

  constructor(
    @Inject(CONTACT_ORG_REPOSITORY) private readonly repo: IContactOrgRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: LinkContactToOrgCommand): Promise<string> {
    // 1. Validate contact exists
    const contact = await this.prisma.contact.findUnique({
      where: { id: command.contactId },
      select: { id: true, isActive: true },
    });
    if (!contact) throw new NotFoundException(`Contact ${command.contactId} not found`);

    // 2. Validate organization exists
    const org = await this.prisma.organization.findUnique({
      where: { id: command.organizationId },
      select: { id: true, isActive: true },
    });
    if (!org) throw new NotFoundException(`Organization ${command.organizationId} not found`);

    // 3. Check for existing link
    const existing = await this.repo.findByContactAndOrg(command.contactId, command.organizationId);
    if (existing && existing.isActive) {
      throw new ConflictException('Contact is already linked to this organization');
    }

    // 4. If reactivating a deactivated link
    if (existing && !existing.isActive) {
      const withEvents = this.publisher.mergeObjectContext(existing);
      withEvents.reactivate();
      if (command.relationType) withEvents.changeRelationType(command.relationType);
      await this.repo.save(withEvents);
      withEvents.commit();
      this.logger.log(`Reactivated link: Contact ${command.contactId} ↔ Org ${command.organizationId}`);
      return existing.id;
    }

    // 5. If isPrimary, unset existing primary for same org
    if (command.isPrimary) {
      await this.prisma.contactOrganization.updateMany({
        where: { organizationId: command.organizationId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // 6. Create new mapping
    const mapping = ContactOrganizationEntity.create(randomUUID(), {
      contactId: command.contactId,
      organizationId: command.organizationId,
      relationType: command.relationType,
      isPrimary: command.isPrimary,
      designation: command.designation,
      department: command.department,
      startDate: command.startDate,
    });

    const withEvents = this.publisher.mergeObjectContext(mapping);
    await this.repo.save(withEvents);
    withEvents.commit();

    this.logger.log(
      `Linked: Contact ${command.contactId} ↔ Org ${command.organizationId} (${mapping.relationType.value})`,
    );
    return mapping.id;
  }
}
