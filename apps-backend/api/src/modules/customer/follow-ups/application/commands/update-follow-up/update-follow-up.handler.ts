// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { UpdateFollowUpCommand } from './update-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateFollowUpCommand)
export class UpdateFollowUpHandler implements ICommandHandler<UpdateFollowUpCommand> {
    private readonly logger = new Logger(UpdateFollowUpHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateFollowUpCommand) {
    try {
      const existing = await this.prisma.working.followUp.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Follow-up not found');

      return this.prisma.working.followUp.update({
        where: { id: cmd.id },
        data: cmd.data as any,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } catch (error) {
      this.logger.error(`UpdateFollowUpHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
