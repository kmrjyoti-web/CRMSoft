import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CheckInVisitCommand } from './check-in-visit.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { haversineDistance } from '../../../../../../common/utils/geo.utils';

@CommandHandler(CheckInVisitCommand)
export class CheckInVisitHandler implements ICommandHandler<CheckInVisitCommand> {
    private readonly logger = new Logger(CheckInVisitHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CheckInVisitCommand) {
    try {
      const visit = await this.prisma.working.tourPlanVisit.findUnique({
        where: { id: cmd.visitId },
        include: { tourPlan: true, lead: true },
      });
      if (!visit) throw new NotFoundException('Visit not found');
      if (visit.actualArrival) throw new BadRequestException('Already checked in');

      let distanceFromTarget: number | undefined;
      if (visit.lead) {
        const leadWithOrg = await this.prisma.working.lead.findUnique({
          where: { id: visit.lead.id },
          include: { organization: true },
        });
        if (leadWithOrg?.organization) {
          const org = leadWithOrg.organization as any;
          if (org.latitude && org.longitude) {
            distanceFromTarget = haversineDistance(
              cmd.latitude, cmd.longitude,
              Number(org.latitude), Number(org.longitude),
            );
          }
        }
      }

      const updated = await this.prisma.working.tourPlanVisit.update({
        where: { id: cmd.visitId },
        data: {
          actualArrival: new Date(),
          checkInLat: cmd.latitude,
          checkInLng: cmd.longitude,
          checkInPhoto: cmd.photoUrl,
          distanceFromTarget,
        },
      });

      if (cmd.photoUrl) {
        await this.prisma.working.tourPlanPhoto.create({
          data: {
            tourPlanVisitId: cmd.visitId,
            photoUrl: cmd.photoUrl,
            photoType: 'CHECK_IN',
            latitude: cmd.latitude,
            longitude: cmd.longitude,
          },
        });
      }

      return updated;
    } catch (error) {
      this.logger.error(`CheckInVisitHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
