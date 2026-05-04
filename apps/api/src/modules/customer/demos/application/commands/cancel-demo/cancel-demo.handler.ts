// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { CancelDemoCommand } from './cancel-demo.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CancelDemoCommand)
export class CancelDemoHandler implements ICommandHandler<CancelDemoCommand> {
    private readonly logger = new Logger(CancelDemoHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CancelDemoCommand) {
    try {
      const existing = await this.prisma.working.demo.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Demo not found');

      const data: any = {
        status: cmd.isNoShow ? 'NO_SHOW' : 'CANCELLED',
        cancelReason: cmd.reason,
      };
      if (cmd.isNoShow) data.noShowReason = cmd.reason;

      const demo = await this.prisma.working.demo.update({
        where: { id: cmd.id },
        data,
        include: { lead: true, conductedBy: true },
      });

      await this.prisma.working.calendarEvent.updateMany({
        where: { eventType: 'DEMO', sourceId: cmd.id },
        data: { isActive: false },
      });

      return demo;
    } catch (error) {
      this.logger.error(`CancelDemoHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
