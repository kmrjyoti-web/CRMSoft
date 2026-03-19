import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateRawContactCommand } from './create-raw-contact.command';
import { RawContactEntity } from '../../../domain/entities/raw-contact.entity';
import {
  IRawContactRepository, RAW_CONTACT_REPOSITORY,
} from '../../../domain/interfaces/raw-contact-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateRawContactCommand)
export class CreateRawContactHandler implements ICommandHandler<CreateRawContactCommand> {
  private readonly logger = new Logger(CreateRawContactHandler.name);

  constructor(
    @Inject(RAW_CONTACT_REPOSITORY) private readonly repo: IRawContactRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: CreateRawContactCommand): Promise<string> {
    // 1. Create domain entity (validates business rules)
    const rawContact = RawContactEntity.create(randomUUID(), {
      firstName: command.firstName,
      lastName: command.lastName,
      source: command.source,
      companyName: command.companyName,
      designation: command.designation,
      department: command.department,
      notes: command.notes,
      createdById: command.createdById,
    });

    // 2. Merge with event publisher
    const withEvents = this.publisher.mergeObjectContext(rawContact);

    // 3. Persist raw contact
    await this.repo.save(withEvents);

    // 4. Create communication records (phone, email, etc.)
    if (command.communications?.length) {
      const seenTypes = new Set<string>();
      for (const comm of command.communications) {
        const isFirstOfType = !seenTypes.has(comm.type);
        seenTypes.add(comm.type);
        await this.prisma.working.communication.create({
          data: {
            type: comm.type as any,
            value: comm.value,
            priorityType: (comm.priorityType as any) || 'PRIMARY',
            label: comm.label,
            isPrimary: comm.isPrimary ?? isFirstOfType,
            rawContactId: rawContact.id,
          },
        });
      }
    }

    // 5. Create filter associations
    if (command.filterIds?.length) {
      await this.prisma.working.rawContactFilter.createMany({
        data: command.filterIds.map(fid => ({
          rawContactId: rawContact.id,
          lookupValueId: fid,
        })),
        skipDuplicates: true,
      });
    }

    // 6. Publish domain events
    withEvents.commit();

    this.logger.log(`RawContact created: ${rawContact.id} (${rawContact.fullName})`);
    return rawContact.id;
  }
}
