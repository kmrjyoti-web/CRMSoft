import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ApproveTourPlanCommand } from './approve-tour-plan.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(ApproveTourPlanCommand)
export class ApproveTourPlanHandler implements ICommandHandler<ApproveTourPlanCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: ApproveTourPlanCommand) {
    const existing = await this.prisma.tourPlan.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Tour plan not found');
    if (existing.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Tour plan is not pending approval');
    }

    return this.prisma.tourPlan.update({
      where: { id: cmd.id },
      data: {
        status: 'APPROVED',
        approvedById: cmd.userId,
        approvedAt: new Date(),
      },
      include: { lead: true, salesPerson: true },
    });
  }
}
