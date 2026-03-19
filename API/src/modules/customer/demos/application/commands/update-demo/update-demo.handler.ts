// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateDemoCommand } from './update-demo.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateDemoCommand)
export class UpdateDemoHandler implements ICommandHandler<UpdateDemoCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateDemoCommand) {
    const existing = await this.prisma.demo.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Demo not found');

    const demo = await this.prisma.demo.update({
      where: { id: cmd.id },
      data: cmd.data as any,
      include: { lead: true, conductedBy: true },
    });

    if (cmd.data.scheduledAt) {
      await this.prisma.calendarEvent.updateMany({
        where: { eventType: 'DEMO', sourceId: cmd.id },
        data: { startTime: cmd.data.scheduledAt },
      });
    }

    return demo;
  }
}
