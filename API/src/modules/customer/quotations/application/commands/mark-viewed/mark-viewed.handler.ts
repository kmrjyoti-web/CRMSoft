import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { MarkViewedCommand } from './mark-viewed.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(MarkViewedCommand)
export class MarkViewedHandler implements ICommandHandler<MarkViewedCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: MarkViewedCommand) {
    const quotation = await this.prisma.working.quotation.findUnique({ where: { id: cmd.id } });
    if (!quotation) throw new NotFoundException('Quotation not found');

    if (quotation.status === 'SENT') {
      await this.prisma.working.quotation.update({
        where: { id: cmd.id },
        data: { status: 'VIEWED' },
      });
    }

    // Update send log view count
    if (cmd.sendLogId) {
      await this.prisma.working.quotationSendLog.update({
        where: { id: cmd.sendLogId },
        data: {
          viewedAt: new Date(),
          viewCount: { increment: 1 },
        },
      });
    } else {
      // Update latest send log
      const latestLog = await this.prisma.working.quotationSendLog.findFirst({
        where: { quotationId: cmd.id },
        orderBy: { sentAt: 'desc' },
      });
      if (latestLog) {
        await this.prisma.working.quotationSendLog.update({
          where: { id: latestLog.id },
          data: { viewedAt: new Date(), viewCount: { increment: 1 } },
        });
      }
    }

    await this.prisma.working.quotationActivity.create({
      data: {
        quotationId: cmd.id, action: 'VIEWED',
        description: 'Quotation viewed by recipient',
        performedById: 'SYSTEM', performedByName: 'System',
      },
    });

    return { viewed: true };
  }
}
