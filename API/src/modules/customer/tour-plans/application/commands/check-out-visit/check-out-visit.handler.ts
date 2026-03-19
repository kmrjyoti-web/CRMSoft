import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CheckOutVisitCommand } from './check-out-visit.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CheckOutVisitCommand)
export class CheckOutVisitHandler implements ICommandHandler<CheckOutVisitCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CheckOutVisitCommand) {
    const visit = await this.prisma.tourPlanVisit.findUnique({ where: { id: cmd.visitId } });
    if (!visit) throw new NotFoundException('Visit not found');
    if (!visit.actualArrival) throw new BadRequestException('Must check in before checking out');
    if (visit.actualDeparture) throw new BadRequestException('Already checked out');

    const updated = await this.prisma.tourPlanVisit.update({
      where: { id: cmd.visitId },
      data: {
        actualDeparture: new Date(),
        checkOutLat: cmd.latitude,
        checkOutLng: cmd.longitude,
        checkOutPhoto: cmd.photoUrl,
        outcome: cmd.outcome,
        notes: cmd.notes,
        isCompleted: true,
      },
    });

    if (cmd.photoUrl) {
      await this.prisma.tourPlanPhoto.create({
        data: {
          tourPlanVisitId: cmd.visitId,
          photoUrl: cmd.photoUrl,
          photoType: 'CHECK_OUT',
          latitude: cmd.latitude,
          longitude: cmd.longitude,
        },
      });
    }

    return updated;
  }
}
