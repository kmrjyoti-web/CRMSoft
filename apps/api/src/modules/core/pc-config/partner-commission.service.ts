import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { IsString, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';
import { PrismaService } from '../../../core/prisma/prisma.service';

// ── DTOs ──────────────────────────────────────────────────────────────────────

export class CreateCommissionRuleDto {
  @IsString() partnerCode: string;
  @IsOptional() @IsString() planCode?: string;
  @IsOptional() @IsIn(['RECURRING', 'ONE_TIME']) commissionType?: string;
  @IsNumber() @Min(0) @Max(100) commissionPct: number;
  @IsOptional() @IsNumber() minTenants?: number;
  @IsOptional() @IsNumber() maxTenants?: number;
}

export class UpdateCommissionRuleDto {
  @IsOptional() @IsNumber() @Min(0) @Max(100) commissionPct?: number;
  @IsOptional() @IsIn(['RECURRING', 'ONE_TIME']) commissionType?: string;
  @IsOptional() @IsNumber() minTenants?: number;
  @IsOptional() @IsNumber() maxTenants?: number;
  @IsOptional() isActive?: boolean;
}

export interface CommissionResult {
  commissionInr: number;
  commissionPct: number;
  partnerCode: string;
  status: string;
  logId: string;
}

export interface RevenueSummary {
  partnerCode: string;
  totalTenants: number;
  paidTenants: number;
  totalRevenueInr: number;
  totalCommissionInr: number;
  pendingCommissionInr: number;
  thisMonthRevenueInr: number;
  thisMonthCommissionInr: number;
}

@Injectable()
export class PartnerCommissionService {
  private readonly logger = new Logger(PartnerCommissionService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Core: Calculate + log commission on payment ─────────────────────────

  async calculateCommission(
    tenantId: string,
    paymentId: string,
    paymentAmountInr: number,
    planCode?: string,
  ): Promise<CommissionResult | null> {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, partnerCode: true, planCode: true } as any,
    }).catch(() => null) as any;

    if (!tenant?.partnerCode) {
      this.logger.debug(`Tenant ${tenantId} has no partnerCode — no commission`);
      return null;
    }

    const resolvedPlan = planCode ?? tenant.planCode ?? null;
    const partnerCode: string = tenant.partnerCode;

    // Find most-specific rule: partner + plan > partner + wildcard > global wildcard + plan > global wildcard
    const rule = await this.prisma.platform.partnerCommissionRule.findFirst({
      where: {
        isActive: true,
        partnerCode: { in: [partnerCode, '*'] },
        planCode: resolvedPlan ? { in: [resolvedPlan, null] } : null,
      },
      orderBy: [
        // More specific rules first: exact partnerCode before wildcard, exact planCode before null
        { partnerCode: 'desc' },
        { planCode: 'desc' },
      ],
    });

    if (!rule) {
      this.logger.debug(`No commission rule for partner ${partnerCode}, plan ${resolvedPlan}`);
      return null;
    }

    const pct = Number(rule.commissionPct);
    const commissionInr = Math.round((paymentAmountInr * pct / 100) * 100) / 100;

    const log = await this.prisma.platform.partnerCommissionLog.create({
      data: {
        partnerCode,
        childTenantId: tenantId,
        paymentId,
        paymentAmountInr,
        commissionPct: pct,
        commissionInr,
        planCode: resolvedPlan,
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Commission logged for partner ${partnerCode}: ₹${commissionInr} (${pct}% of ₹${paymentAmountInr}) — log ${log.id}`,
    );

    return { commissionInr, commissionPct: pct, partnerCode, status: 'PENDING', logId: log.id };
  }

  // ─── Rule CRUD ────────────────────────────────────────────────────────────

  async listRules(partnerCode?: string) {
    return this.prisma.platform.partnerCommissionRule.findMany({
      where: partnerCode ? { partnerCode } : undefined,
      orderBy: [{ partnerCode: 'asc' }, { planCode: 'asc' }],
    });
  }

  async createRule(dto: CreateCommissionRuleDto) {
    return this.prisma.platform.partnerCommissionRule.create({
      data: {
        partnerCode: dto.partnerCode,
        planCode: dto.planCode ?? null,
        commissionType: dto.commissionType ?? 'RECURRING',
        commissionPct: dto.commissionPct,
        minTenants: dto.minTenants ?? null,
        maxTenants: dto.maxTenants ?? null,
      },
    });
  }

  async updateRule(id: string, dto: UpdateCommissionRuleDto) {
    const existing = await this.prisma.platform.partnerCommissionRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Commission rule ${id} not found`);

    return this.prisma.platform.partnerCommissionRule.update({
      where: { id },
      data: {
        ...(dto.commissionPct !== undefined && { commissionPct: dto.commissionPct }),
        ...(dto.commissionType !== undefined && { commissionType: dto.commissionType }),
        ...(dto.minTenants !== undefined && { minTenants: dto.minTenants }),
        ...(dto.maxTenants !== undefined && { maxTenants: dto.maxTenants }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deleteRule(id: string) {
    const existing = await this.prisma.platform.partnerCommissionRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Commission rule ${id} not found`);
    await this.prisma.platform.partnerCommissionRule.delete({ where: { id } });
    return { deleted: true };
  }

  // ─── Logs ─────────────────────────────────────────────────────────────────

  async getLogs(partnerCode?: string, status?: string, from?: Date, to?: Date) {
    const where: any = {};
    if (partnerCode) where.partnerCode = partnerCode;
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }
    return this.prisma.platform.partnerCommissionLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  // ─── Revenue summary ──────────────────────────────────────────────────────

  async getRevenueSummary(partnerCode: string): Promise<RevenueSummary> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [logs, monthLogs, tenants] = await Promise.all([
      this.prisma.platform.partnerCommissionLog.findMany({
        where: { partnerCode },
        select: { paymentAmountInr: true, commissionInr: true, childTenantId: true, status: true },
      }),
      this.prisma.platform.partnerCommissionLog.findMany({
        where: { partnerCode, createdAt: { gte: monthStart } },
        select: { paymentAmountInr: true, commissionInr: true },
      }),
      this.prisma.identity.tenant.findMany({
        where: { partnerCode } as any,
        select: { id: true, subscriptionStatus: true } as any,
      }),
    ]);

    const totalRevenueInr = logs.reduce((s, l) => s + Number(l.paymentAmountInr), 0);
    const totalCommissionInr = logs.reduce((s, l) => s + Number(l.commissionInr), 0);
    const pendingCommissionInr = logs
      .filter((l) => l.status === 'PENDING')
      .reduce((s, l) => s + Number(l.commissionInr), 0);
    const paidTenants = new Set(logs.map((l) => l.childTenantId)).size;

    return {
      partnerCode,
      totalTenants: (tenants as any[]).length,
      paidTenants,
      totalRevenueInr: Math.round(totalRevenueInr * 100) / 100,
      totalCommissionInr: Math.round(totalCommissionInr * 100) / 100,
      pendingCommissionInr: Math.round(pendingCommissionInr * 100) / 100,
      thisMonthRevenueInr: Math.round(monthLogs.reduce((s, l) => s + Number(l.paymentAmountInr), 0) * 100) / 100,
      thisMonthCommissionInr: Math.round(monthLogs.reduce((s, l) => s + Number(l.commissionInr), 0) * 100) / 100,
    };
  }

  // ─── Seed default rules (idempotent) ──────────────────────────────────────

  async seedDefaultRules(): Promise<void> {
    const existing = await this.prisma.platform.partnerCommissionRule.count({
      where: { partnerCode: '*' },
    });
    if (existing > 0) return;

    await this.prisma.platform.partnerCommissionRule.createMany({
      data: [
        { partnerCode: '*',  planCode: null,             commissionType: 'RECURRING', commissionPct: 20.00 },
        { partnerCode: '*',  planCode: 'WL_PROFESSIONAL', commissionType: 'RECURRING', commissionPct: 22.00 },
        { partnerCode: '*',  planCode: 'WL_ENTERPRISE',   commissionType: 'RECURRING', commissionPct: 25.00 },
      ],
      skipDuplicates: true,
    });
    this.logger.log('Default commission rules seeded');
  }
}
