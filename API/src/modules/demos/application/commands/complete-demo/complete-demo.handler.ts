import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CompleteDemoCommand } from './complete-demo.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CompleteDemoCommand)
export class CompleteDemoHandler implements ICommandHandler<CompleteDemoCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CompleteDemoCommand) {
    const existing = await this.prisma.demo.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Demo not found');

    return this.prisma.demo.update({
      where: { id: cmd.id },
      data: {
        status: 'COMPLETED',
        result: cmd.result as any,
        outcome: cmd.outcome,
        notes: cmd.notes || existing.notes,
        completedAt: new Date(),
      },
      include: { lead: true, conductedBy: true },
    });
  }
}
