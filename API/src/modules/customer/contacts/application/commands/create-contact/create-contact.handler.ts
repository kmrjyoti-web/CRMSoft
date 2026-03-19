import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateContactCommand } from './create-contact.command';
import { ContactEntity } from '../../../domain/entities/contact.entity';
import {
  IContactRepository, CONTACT_REPOSITORY,
} from '../../../domain/interfaces/contact-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

/**
 * Create a verified Contact directly (admin flow).
 * Also supports creating Communications, Org link, and Filters in one call.
 *
 * NOTE: The main contact creation path is via VerifyRawContactHandler.
 * This command is for admin/bulk operations where no RawContact exists.
 */
@CommandHandler(CreateContactCommand)
export class CreateContactHandler implements ICommandHandler<CreateContactCommand> {
  private readonly logger = new Logger(CreateContactHandler.name);

  constructor(
    @Inject(CONTACT_REPOSITORY) private readonly repo: IContactRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: CreateContactCommand): Promise<string> {
    // 1. Create domain entity
    const contact = ContactEntity.create(randomUUID(), {
      firstName: command.firstName,
      lastName: command.lastName,
      designation: command.designation,
      department: command.department,
      notes: command.notes,
      createdById: command.createdById,
    });

    // 2. Merge with event publisher
    const withEvents = this.publisher.mergeObjectContext(contact);

    // 3. Persist contact
    await this.repo.save(withEvents);

    // 4. Create communications (phone, email, etc.)
    if (command.communications?.length) {
      for (const comm of command.communications) {
        await this.prisma.working.communication.create({
          data: {
            type: comm.type as any,
            value: comm.value,
            priorityType: (comm.priorityType as any) || 'PRIMARY',
            label: comm.label,
            isPrimary: comm.isPrimary ?? false,
            contactId: contact.id,
          },
        });
      }
    }

    // 5. Link to organization
    if (command.organizationId) {
      await this.prisma.working.contactOrganization.create({
        data: {
          contactId: contact.id,
          organizationId: command.organizationId,
          relationType: (command.orgRelationType as any) || 'EMPLOYEE',
          designation: command.designation,
          department: command.department,
        },
      });
    }

    // 6. Create filter associations
    if (command.filterIds?.length) {
      await this.prisma.working.contactFilter.createMany({
        data: command.filterIds.map(fid => ({
          contactId: contact.id,
          lookupValueId: fid,
        })),
        skipDuplicates: true,
      });
    }

    // 7. Publish events
    withEvents.commit();

    this.logger.log(`Contact created directly: ${contact.id} (${contact.fullName})`);
    return contact.id;
  }
}
