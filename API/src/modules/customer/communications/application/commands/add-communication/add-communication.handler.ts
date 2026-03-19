import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AddCommunicationCommand } from './add-communication.command';
import { CommunicationEntity } from '../../../domain/entities/communication.entity';
import {
  ICommunicationRepository, COMMUNICATION_REPOSITORY,
} from '../../../domain/interfaces/communication-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

/**
 * Add a new communication (phone, email, etc.) to an entity.
 *
 * If isPrimary=true, unsets any existing primary of the same type for the same entity.
 */
@CommandHandler(AddCommunicationCommand)
export class AddCommunicationHandler implements ICommandHandler<AddCommunicationCommand> {
  private readonly logger = new Logger(AddCommunicationHandler.name);

  constructor(
    @Inject(COMMUNICATION_REPOSITORY) private readonly repo: ICommunicationRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: AddCommunicationCommand): Promise<string> {
    // 1. Create domain entity (validates type, format, entity link)
    const comm = CommunicationEntity.create(randomUUID(), {
      type: command.type,
      value: command.value,
      priorityType: command.priorityType,
      isPrimary: command.isPrimary,
      label: command.label,
      rawContactId: command.rawContactId,
      contactId: command.contactId,
      organizationId: command.organizationId,
      leadId: command.leadId,
    });

    // 2. If setting as primary, unset existing primary of same type
    if (command.isPrimary) {
      await this.unsetExistingPrimary(command);
    }

    // 3. Persist
    const withEvents = this.publisher.mergeObjectContext(comm);
    await this.repo.save(withEvents);
    withEvents.commit();

    this.logger.log(`Communication added: ${command.type} = ${command.value}`);
    return comm.id;
  }

  private async unsetExistingPrimary(cmd: AddCommunicationCommand): Promise<void> {
    const where: any = { type: cmd.type, isPrimary: true };
    if (cmd.contactId) where.contactId = cmd.contactId;
    else if (cmd.rawContactId) where.rawContactId = cmd.rawContactId;
    else if (cmd.organizationId) where.organizationId = cmd.organizationId;
    else if (cmd.leadId) where.leadId = cmd.leadId;

    await this.prisma.communication.updateMany({
      where,
      data: { isPrimary: false },
    });
  }
}
