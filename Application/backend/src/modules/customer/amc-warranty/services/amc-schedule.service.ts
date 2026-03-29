import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class AMCScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, filters?: { from?: Date; to?: Date; status?: string }) {
    return this.prisma.working.aMCSchedule.findMany({
      where: {
        tenantId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.from || filters?.to
          ? {
              scheduleDate: {
                ...(filters.from && { gte: filters.from }),
                ...(filters.to && { lte: filters.to }),
              },
            }
          : {}),
      },
      include: { contract: { include: { plan: true } } },
      orderBy: { scheduleDate: 'asc' },
    });
  }

  async complete(tenantId: string, id: string, dto: any) {
    const schedule = await this.prisma.working.aMCSchedule.findFirst({ where: { id, tenantId } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return this.prisma.working.aMCSchedule.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedDate: dto.completedDate ?? new Date(),
        serviceNotes: dto.serviceNotes,
        partsUsed: dto.partsUsed,
        customerSignature: dto.customerSignature,
        nextScheduleDate: dto.nextScheduleDate,
        usageAtVisit: dto.usageAtVisit,
        assignedToId: dto.assignedToId,
        assignedToName: dto.assignedToName,
      },
    });
  }

  async reschedule(tenantId: string, id: string, newDate: Date) {
    const schedule = await this.prisma.working.aMCSchedule.findFirst({ where: { id, tenantId } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return this.prisma.working.aMCSchedule.update({
      where: { id },
      data: { scheduleDate: newDate, status: 'RESCHEDULED' },
    });
  }
}
