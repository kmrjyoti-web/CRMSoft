import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubmitTourPlanCommand } from './submit-tour-plan.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(SubmitTourPlanCommand)
export class SubmitTourPlanHandler implements ICommandHandler<SubmitTourPlanCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: SubmitTourPlanCommand) {
    const existing = await this.prisma.tourPlan.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Tour plan not found');
    if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
      throw new BadRequestException('Can only submit tour plans in DRAFT or REJECTED status');
    }

    return this.prisma.tourPlan.update({
      where: { id: cmd.id },
      data: { status: 'PENDING_APPROVAL' },
      include: { lead: true, salesPerson: true },
    });
  }
}
