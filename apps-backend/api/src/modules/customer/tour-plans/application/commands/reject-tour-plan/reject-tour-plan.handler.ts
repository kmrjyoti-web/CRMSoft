// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { RejectTourPlanCommand } from './reject-tour-plan.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(RejectTourPlanCommand)
export class RejectTourPlanHandler implements ICommandHandler<RejectTourPlanCommand> {
    private readonly logger = new Logger(RejectTourPlanHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RejectTourPlanCommand) {
    try {
      const existing = await this.prisma.working.tourPlan.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Tour plan not found');
      if (existing.status !== 'PENDING_APPROVAL') {
        throw new BadRequestException('Tour plan is not pending approval');
      }

      return this.prisma.working.tourPlan.update({
        where: { id: cmd.id },
        data: { status: 'REJECTED', rejectedReason: cmd.reason },
        include: { lead: true, salesPerson: true },
      });
    } catch (error) {
      this.logger.error(`RejectTourPlanHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
