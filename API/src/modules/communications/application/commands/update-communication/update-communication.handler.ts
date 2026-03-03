import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { UpdateCommunicationCommand } from './update-communication.command';
import {
  ICommunicationRepository, COMMUNICATION_REPOSITORY,
} from '../../../domain/interfaces/communication-repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateCommunicationCommand)
export class UpdateCommunicationHandler implements ICommandHandler<UpdateCommunicationCommand> {
  private readonly logger = new Logger(UpdateCommunicationHandler.name);

  constructor(
    @Inject(COMMUNICATION_REPOSITORY) private readonly repo: ICommunicationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: UpdateCommunicationCommand): Promise<void> {
    const comm = await this.repo.findById(command.communicationId);
    if (!comm) throw new NotFoundException(`Communication ${command.communicationId} not found`);

    const updateData: any = {};
    if (command.data.value !== undefined) updateData.value = command.data.value;
    if (command.data.priorityType !== undefined) updateData.priorityType = command.data.priorityType;
    if (command.data.label !== undefined) updateData.label = command.data.label;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields provided to update');
    }

    await this.prisma.communication.update({
      where: { id: command.communicationId },
      data: updateData,
    });

    this.logger.log(`Communication ${command.communicationId} updated`);
  }
}
