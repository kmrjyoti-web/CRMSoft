// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { UpdateDemoCommand } from './update-demo.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateDemoCommand)
export class UpdateDemoHandler implements ICommandHandler<UpdateDemoCommand> {
    private readonly logger = new Logger(UpdateDemoHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateDemoCommand) {
    try {
      const existing = await this.prisma.working.demo.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Demo not found');

      const demo = await this.prisma.working.demo.update({
        where: { id: cmd.id },
        data: cmd.data as any,
        include: { lead: true, conductedBy: true },
      });

      if (cmd.data.scheduledAt) {
        await this.prisma.working.calendarEvent.updateMany({
          where: { eventType: 'DEMO', sourceId: cmd.id },
          data: { startTime: cmd.data.scheduledAt },
        });
      }

      return demo;
    } catch (error) {
      this.logger.error(`UpdateDemoHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
