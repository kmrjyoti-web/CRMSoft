import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateBroadcastCommand } from './create-broadcast.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CreateBroadcastCommand)
export class CreateBroadcastHandler implements ICommandHandler<CreateBroadcastCommand> {
  private readonly logger = new Logger(CreateBroadcastHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateBroadcastCommand) {
    const broadcast = await this.prisma.waBroadcast.create({
      data: {
        wabaId: command.wabaId,
        name: command.name,
        templateId: command.templateId,
        status: 'DRAFT',
        scheduledAt: command.scheduledAt,
        throttlePerSecond: command.throttlePerSecond,
        createdById: command.userId,
        createdByName: command.userName,
      },
    });

    this.logger.log(
      `Broadcast "${command.name}" created with status DRAFT by user ${command.userId}`,
    );

    return broadcast;
  }
}
