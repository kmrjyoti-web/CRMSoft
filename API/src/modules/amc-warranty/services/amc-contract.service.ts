import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class AMCContractService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.aMCContract.count({ where: { tenantId } });
    return `AMC-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(tenantId: string, filters?: { customerId?: string; status?: string }) {
    return this.prisma.aMCContract.findMany({
      where: {
        tenantId,
        ...(filters?.customerId && { customerId: filters.customerId }),
        ...(filters?.status && { status: filters.status }),
      },
      include: { plan: true, _count: { select: { schedules: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const contract = await this.prisma.aMCContract.findFirst({
      where: { id, tenantId },
      include: {
        plan: true,
        schedules: { orderBy: { scheduleDate: 'asc' } },
      },
    });
    if (!contract) throw new NotFoundException('AMC contract not found');
    return contract;
  }

  async findExpiring(tenantId: string, days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return this.prisma.aMCContract.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        endDate: { lte: cutoff, gte: new Date() },
      },
      include: { plan: true },
      orderBy: { endDate: 'asc' },
    });
  }

  async create(tenantId: string, dto: any) {
    const plan = await this.prisma.aMCPlanTemplate.findFirst({ where: { id: dto.amcPlanId } });
    if (!plan) throw new NotFoundException('AMC plan not found');

    const contractNumber = await this.generateNumber(tenantId);
    const balanceAmount = Number(dto.totalAmount) - (Number(dto.paidAmount) ?? 0);

    const contract = await this.prisma.aMCContract.create({
      data: {
        ...dto,
        tenantId,
        contractNumber,
        balanceAmount,
        freeVisitsTotal: plan.freeVisits,
        freeCallsTotal: plan.freeCallSupport,
        freeOnlineTotal: plan.freeOnlineSupport,
        billingCycle: plan.billingCycle,
        status: 'DRAFT',
      },
      include: { plan: true },
    });
    return contract;
  }

  async activate(tenantId: string, id: string) {
    const contract = await this.prisma.aMCContract.findFirst({ where: { id, tenantId } });
    if (!contract) throw new NotFoundException('Contract not found');

    const plan = await this.prisma.aMCPlanTemplate.findUnique({ where: { id: contract.amcPlanId } });
    if (!plan) throw new NotFoundException('Plan not found');

    // Auto-schedule visits based on plan
    const schedules: any[] = [];
    if (plan.visitScheduleType === 'INTERVAL_MONTHS' && plan.visitScheduleValue) {
      const endDate = new Date(contract.endDate);
      let currentDate = new Date(contract.startDate);
      currentDate.setMonth(currentDate.getMonth() + plan.visitScheduleValue);

      while (currentDate <= endDate) {
        schedules.push({
          tenantId,
          amcContractId: id,
          scheduleDate: new Date(currentDate),
          scheduleType: 'PREVENTIVE',
          status: 'SCHEDULED',
        });
        currentDate.setMonth(currentDate.getMonth() + plan.visitScheduleValue);
      }
    }

    await this.prisma.$transaction([
      this.prisma.aMCContract.update({ where: { id }, data: { status: 'ACTIVE' } }),
      ...schedules.map((s) => this.prisma.aMCSchedule.create({ data: s })),
    ]);

    return this.findById(tenantId, id);
  }

  async renew(tenantId: string, id: string, dto: any) {
    const contract = await this.prisma.aMCContract.findFirst({
      where: { id, tenantId },
      include: { plan: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    const plan = contract.plan;
    const newStart = new Date(contract.endDate);
    newStart.setDate(newStart.getDate() + 1);

    const newEnd = new Date(newStart);
    if (plan.durationType === 'MONTHS') newEnd.setMonth(newEnd.getMonth() + plan.durationValue);
    else newEnd.setFullYear(newEnd.getFullYear() + plan.durationValue);

    const contractNumber = await this.generateNumber(tenantId);
    const totalAmount = dto.totalAmount ?? Number(plan.charges);
    const discount = plan.renewalDiscount ? totalAmount * (Number(plan.renewalDiscount) / 100) : 0;
    const finalAmount = totalAmount - discount;

    return this.prisma.aMCContract.create({
      data: {
        tenantId,
        amcPlanId: contract.amcPlanId,
        contractNumber,
        customerId: contract.customerId,
        customerType: contract.customerType,
        customerName: contract.customerName,
        productIds: contract.productIds ?? [],
        serialIds: contract.serialIds ?? [],
        startDate: newStart,
        endDate: newEnd,
        status: 'DRAFT',
        totalAmount: finalAmount,
        paidAmount: 0,
        balanceAmount: finalAmount,
        billingCycle: plan.billingCycle,
        freeVisitsTotal: plan.freeVisits,
        freeCallsTotal: plan.freeCallSupport,
        freeOnlineTotal: plan.freeOnlineSupport,
        renewedFromId: id,
        autoRenew: contract.autoRenew,
      },
      include: { plan: true },
    });
  }
}
