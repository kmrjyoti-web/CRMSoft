// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { SubmitTourPlanCommand } from './submit-tour-plan.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(SubmitTourPlanCommand)
export class SubmitTourPlanHandler implements ICommandHandler<SubmitTourPlanCommand> {
    private readonly logger = new Logger(SubmitTourPlanHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: SubmitTourPlanCommand) {
    try {
      const existing = await this.prisma.working.tourPlan.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Tour plan not found');
      if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
        throw new BadRequestException('Can only submit tour plans in DRAFT or REJECTED status');
      }

      return this.prisma.working.tourPlan.update({
        where: { id: cmd.id },
        data: { status: 'PENDING_APPROVAL' },
        include: { lead: true, salesPerson: true },
      });
    } catch (error) {
      this.logger.error(`SubmitTourPlanHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
