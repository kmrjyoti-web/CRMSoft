import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { MarkVerifiedCommand } from './mark-verified.command';
import {
  ICommunicationRepository, COMMUNICATION_REPOSITORY,
} from '../../../domain/interfaces/communication-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(MarkVerifiedCommand)
export class MarkVerifiedHandler implements ICommandHandler<MarkVerifiedCommand> {
  private readonly logger = new Logger(MarkVerifiedHandler.name);

  constructor(
    @Inject(COMMUNICATION_REPOSITORY) private readonly repo: ICommunicationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: MarkVerifiedCommand): Promise<void> {
    const comm = await this.repo.findById(command.communicationId);
    if (!comm) throw new NotFoundException(`Communication ${command.communicationId} not found`);

    if (comm.isVerified) return; // Already verified

    await this.prisma.communication.update({
      where: { id: command.communicationId },
      data: { isVerified: true },
    });

    this.logger.log(`Communication ${command.communicationId} marked verified`);
  }
}
