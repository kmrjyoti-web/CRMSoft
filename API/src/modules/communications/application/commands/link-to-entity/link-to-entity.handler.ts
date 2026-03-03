import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { LinkToEntityCommand } from './link-to-entity.command';
import {
  ICommunicationRepository, COMMUNICATION_REPOSITORY,
} from '../../../domain/interfaces/communication-repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

/**
 * Link an existing communication to an additional entity.
 * Used when: RawContact verified → link comms to Contact.
 * Or when: Contact linked to org → link primary comms to org.
 */
@CommandHandler(LinkToEntityCommand)
export class LinkToEntityHandler implements ICommandHandler<LinkToEntityCommand> {
  private readonly logger = new Logger(LinkToEntityHandler.name);

  constructor(
    @Inject(COMMUNICATION_REPOSITORY) private readonly repo: ICommunicationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: LinkToEntityCommand): Promise<void> {
    const comm = await this.repo.findById(command.communicationId);
    if (!comm) throw new NotFoundException(`Communication ${command.communicationId} not found`);

    const updateData: any = {};
    switch (command.entityType) {
      case 'contact': updateData.contactId = command.entityId; break;
      case 'organization': updateData.organizationId = command.entityId; break;
      case 'lead': updateData.leadId = command.entityId; break;
      default: throw new Error(`Invalid entity type: ${command.entityType}`);
    }

    await this.prisma.communication.update({
      where: { id: command.communicationId },
      data: updateData,
    });

    this.logger.log(
      `Communication ${command.communicationId} linked to ${command.entityType}:${command.entityId}`,
    );
  }
}
