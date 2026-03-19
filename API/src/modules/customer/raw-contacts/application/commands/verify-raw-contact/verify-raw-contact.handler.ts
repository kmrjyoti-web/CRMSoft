import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { VerifyRawContactCommand } from './verify-raw-contact.command';
import {
  IRawContactRepository, RAW_CONTACT_REPOSITORY,
} from '../../../domain/interfaces/raw-contact-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

/**
 * Verify RawContact → creates Contact + updates Communications.
 *
 * FLOW:
 * 1. Load RawContact aggregate
 * 2. Create Contact record in DB
 * 3. Call rawContact.verify(contactId, verifiedById) — domain validates
 * 4. Update all Communication records → set contactId
 * 5. If organizationId provided → create ContactOrganization mapping
 * 6. If org primary → update Communication with organizationId
 * 7. Save + publish events
 */
@CommandHandler(VerifyRawContactCommand)
export class VerifyRawContactHandler implements ICommandHandler<VerifyRawContactCommand> {
  private readonly logger = new Logger(VerifyRawContactHandler.name);

  constructor(
    @Inject(RAW_CONTACT_REPOSITORY) private readonly repo: IRawContactRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: VerifyRawContactCommand): Promise<string> {
    // 1. Load raw contact
    const rawContact = await this.repo.findById(command.rawContactId);
    if (!rawContact) {
      throw new NotFoundException(`RawContact ${command.rawContactId} not found`);
    }

    // 2. Get tenantId from the raw contact DB record
    const rawContactDb = await this.prisma.rawContact.findUnique({
      where: { id: command.rawContactId },
      select: { tenantId: true },
    });
    const tenantId = rawContactDb?.tenantId ?? '';

    // 3. Create Contact record
    const contactId = randomUUID();
    await this.prisma.contact.create({
      data: {
        id: contactId,
        tenantId,
        firstName: rawContact.firstName,
        lastName: rawContact.lastName,
        designation: rawContact.designation,
        department: rawContact.department,
        notes: rawContact.notes,
        createdById: command.verifiedById,
      },
    });

    // 4. Domain validates transition (RAW → VERIFIED)
    const withEvents = this.publisher.mergeObjectContext(rawContact);
    withEvents.verify(contactId, command.verifiedById);

    // 5. Update all Communications → link to new Contact
    await this.prisma.communication.updateMany({
      where: { rawContactId: rawContact.id },
      data: { contactId },
    });

    // 6. Copy filters from raw_contact_filters → contact_filters
    const rawFilters = await this.prisma.rawContactFilter.findMany({
      where: { rawContactId: rawContact.id },
    });
    if (rawFilters.length) {
      await this.prisma.contactFilter.createMany({
        data: rawFilters.map(f => ({
          contactId,
          lookupValueId: f.lookupValueId,
        })),
        skipDuplicates: true,
      });
    }

    // 7. If organization provided → create mapping
    if (command.organizationId) {
      await this.prisma.contactOrganization.create({
        data: {
          contactId,
          organizationId: command.organizationId,
          relationType: (command.contactOrgRelationType as any) || 'EMPLOYEE',
          designation: rawContact.designation,
          department: rawContact.department,
        },
      });

      // Update primary communications with organizationId
      await this.prisma.communication.updateMany({
        where: { rawContactId: rawContact.id, isPrimary: true },
        data: { organizationId: command.organizationId },
      });
    }

    // 8. Save raw contact (now VERIFIED with contactId)
    await this.repo.save(withEvents);

    // 9. Publish events (triggers OnRawContactVerifiedHandler → auto-create ledger)
    withEvents.commit();

    this.logger.log(
      `RawContact ${rawContact.id} verified → Contact ${contactId}`,
    );
    return contactId;
  }
}
