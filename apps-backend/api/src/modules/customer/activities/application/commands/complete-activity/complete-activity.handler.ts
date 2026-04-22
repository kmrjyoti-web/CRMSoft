// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { CompleteActivityCommand } from './complete-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CrossDbResolverService } from '../../../../../../core/prisma/cross-db-resolver.service';

@CommandHandler(CompleteActivityCommand)
export class CompleteActivityHandler implements ICommandHandler<CompleteActivityCommand> {
    private readonly logger = new Logger(CompleteActivityHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: CrossDbResolverService,
  ) {}

  async execute(cmd: CompleteActivityCommand) {
    try {
      const existing = await this.prisma.working.activity.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Activity not found');

      const activity = await this.prisma.working.activity.update({
        where: { id: cmd.id },
        data: {
          outcome: cmd.outcome,
          completedAt: new Date(),
        },
        include: { lead: true, contact: true },
      });

      const createdByUser = await this.resolver.resolveUser(activity.createdById);
      return { ...activity, createdByUser };
    } catch (error) {
      this.logger.error(`CompleteActivityHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
