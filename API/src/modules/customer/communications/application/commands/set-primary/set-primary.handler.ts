import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { SetPrimaryCommunicationCommand } from './set-primary.command';
import {
  ICommunicationRepository, COMMUNICATION_REPOSITORY,
} from '../../../domain/interfaces/communication-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

/**
 * Set a communication as primary.
 * Unsets any existing primary of the same type for the same entity.
 */
@CommandHandler(SetPrimaryCommunicationCommand)
export class SetPrimaryHandler implements ICommandHandler<SetPrimaryCommunicationCommand> {
  private readonly logger = new Logger(SetPrimaryHandler.name);

  constructor(
    @Inject(COMMUNICATION_REPOSITORY) private readonly repo: ICommunicationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: SetPrimaryCommunicationCommand): Promise<void> {
    const comm = await this.repo.findById(command.communicationId);
    if (!comm) throw new NotFoundException(`Communication ${command.communicationId} not found`);

    if (comm.isPrimary) return; // Already primary

    // Unset existing primary of same type for same entity
    const where: any = { type: comm.type.value, isPrimary: true };
    if (comm.contactId) where.contactId = comm.contactId;
    else if (comm.rawContactId) where.rawContactId = comm.rawContactId;
    else if (comm.organizationId) where.organizationId = comm.organizationId;
    else if (comm.leadId) where.leadId = comm.leadId;

    await this.prisma.working.communication.updateMany({ where, data: { isPrimary: false } });

    // Set this one as primary
    await this.prisma.working.communication.update({
      where: { id: command.communicationId },
      data: { isPrimary: true },
    });

    this.logger.log(`Communication ${command.communicationId} set as primary`);
  }
}
