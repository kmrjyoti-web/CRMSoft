// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { CompleteDemoCommand } from './complete-demo.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CompleteDemoCommand)
export class CompleteDemoHandler implements ICommandHandler<CompleteDemoCommand> {
    private readonly logger = new Logger(CompleteDemoHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CompleteDemoCommand) {
    try {
      const existing = await this.prisma.working.demo.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Demo not found');

      return this.prisma.working.demo.update({
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
    } catch (error) {
      this.logger.error(`CompleteDemoHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
