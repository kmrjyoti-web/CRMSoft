import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const PLAN_LIMITS: Record<string, { maxInstances: number; scaleUpThreshold: number; scaleDownThreshold: number }> = {
  STARTER: { maxInstances: 2, scaleUpThreshold: 80, scaleDownThreshold: 20 },
  PROFESSIONAL: { maxInstances: 5, scaleUpThreshold: 75, scaleDownThreshold: 25 },
  ENTERPRISE: { maxInstances: 10, scaleUpThreshold: 70, scaleDownThreshold: 30 },
};

@Injectable()
export class ScalingService {
  private readonly logger = new Logger(ScalingService.name);

  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async getOrCreatePolicy(partnerId: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const limits = PLAN_LIMITS[partner.plan] ?? PLAN_LIMITS.STARTER;
    return this.prisma.partnerScalingPolicy.upsert({
      where: { partnerId },
      create: {
        partnerId,
        maxInstances: limits.maxInstances,
        minInstances: 1,
        currentInstances: 1,
        scaleUpThreshold: limits.scaleUpThreshold,
        scaleDownThreshold: limits.scaleDownThreshold,
        isAutoScalingEnabled: false,
        cooldownMinutes: 15,
      },
      update: {},
    });
  }

  async updatePolicy(
    partnerId: string,
    dto: {
      maxInstances?: number;
      minInstances?: number;
      scaleUpThreshold?: number;
      scaleDownThreshold?: number;
      isAutoScalingEnabled?: boolean;
      cooldownMinutes?: number;
    },
  ) {
    await this.getOrCreatePolicy(partnerId);
    return this.prisma.partnerScalingPolicy.update({ where: { partnerId }, data: dto });
  }

  private async computeUsageMetric(partnerId: string): Promise<number> {
    const period = this.getCurrentPeriod();
    const usageLogs = await this.prisma.partnerUsageLog.findMany({ where: { partnerId, period } });
    if (usageLogs.length === 0) return 0;

    const totalCharged = usageLogs.reduce((sum, l) => sum + Number(l.totalChargedToPartner), 0);
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    const maxTenants = partner?.maxTenants ?? 10;
    const estimatedCapacity = maxTenants * 1000;
    return Math.min(100, Math.round((totalCharged / estimatedCapacity) * 100));
  }

  async evaluatePartner(partnerId: string): Promise<{ action: string; metric: number }> {
    const policy = await this.getOrCreatePolicy(partnerId);

    if (!policy.isAutoScalingEnabled) {
      return { action: 'DISABLED', metric: 0 };
    }

    const now = new Date();
    if (policy.lastScaledAt) {
      const cooldownMs = policy.cooldownMinutes * 60 * 1000;
      if (now.getTime() - policy.lastScaledAt.getTime() < cooldownMs) {
        return { action: 'COOLDOWN', metric: 0 };
      }
    }

    const usageMetric = await this.computeUsageMetric(partnerId);

    if (usageMetric >= policy.scaleUpThreshold && policy.currentInstances < policy.maxInstances) {
      await this.scaleUp(partnerId, policy, usageMetric);
      return { action: 'SCALE_UP', metric: usageMetric };
    }

    if (usageMetric <= policy.scaleDownThreshold && policy.currentInstances > policy.minInstances) {
      await this.scaleDown(partnerId, policy, usageMetric);
      return { action: 'SCALE_DOWN', metric: usageMetric };
    }

    return { action: 'NO_CHANGE', metric: usageMetric };
  }

  private async scaleUp(partnerId: string, policy: { currentInstances: number }, usageMetric: number): Promise<void> {
    const toInstances = policy.currentInstances + 1;
    await this.prisma.partnerScalingPolicy.update({
      where: { partnerId },
      data: { currentInstances: toInstances, lastScaledAt: new Date() },
    });
    await this.prisma.partnerScalingEvent.create({
      data: {
        partnerId,
        eventType: 'SCALE_UP',
        fromInstances: policy.currentInstances,
        toInstances,
        reason: `Usage at ${usageMetric}% exceeded scale-up threshold`,
        usageMetric,
        triggeredBy: 'auto',
      },
    });
    await this.audit.log({
      partnerId,
      action: 'AUTO_SCALED_UP',
      performedBy: 'system',
      performedByRole: 'SYSTEM',
      details: { from: policy.currentInstances, to: toInstances, usageMetric },
    });
    this.logger.log(`Partner ${partnerId} scaled UP: ${policy.currentInstances} → ${toInstances} (usage: ${usageMetric}%)`);
  }

  private async scaleDown(partnerId: string, policy: { currentInstances: number }, usageMetric: number): Promise<void> {
    const toInstances = policy.currentInstances - 1;
    await this.prisma.partnerScalingPolicy.update({
      where: { partnerId },
      data: { currentInstances: toInstances, lastScaledAt: new Date() },
    });
    await this.prisma.partnerScalingEvent.create({
      data: {
        partnerId,
        eventType: 'SCALE_DOWN',
        fromInstances: policy.currentInstances,
        toInstances,
        reason: `Usage at ${usageMetric}% fell below scale-down threshold`,
        usageMetric,
        triggeredBy: 'auto',
      },
    });
    await this.audit.log({
      partnerId,
      action: 'AUTO_SCALED_DOWN',
      performedBy: 'system',
      performedByRole: 'SYSTEM',
      details: { from: policy.currentInstances, to: toInstances, usageMetric },
    });
    this.logger.log(`Partner ${partnerId} scaled DOWN: ${policy.currentInstances} → ${toInstances} (usage: ${usageMetric}%)`);
  }

  async evaluateAll(): Promise<void> {
    const partners = await this.prisma.whiteLabelPartner.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, companyName: true },
    });

    for (const partner of partners) {
      try {
        const result = await this.evaluatePartner(partner.id);
        if (result.action !== 'NO_CHANGE' && result.action !== 'DISABLED' && result.action !== 'COOLDOWN') {
          this.logger.log(`${partner.companyName}: ${result.action} at ${result.metric}%`);
        }
      } catch (err: unknown) {
        this.logger.error(`Failed to evaluate scaling for ${partner.companyName}`, err instanceof Error ? err.stack : String(err));
      }
    }
  }

  async getScalingHistory(partnerId: string, limit = 20) {
    return this.prisma.partnerScalingEvent.findMany({
      where: { partnerId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getScalingDashboard() {
    const [totalScaleUps, totalScaleDowns, enabledPolicies, recentEvents] = await Promise.all([
      this.prisma.partnerScalingEvent.count({ where: { eventType: 'SCALE_UP' } }),
      this.prisma.partnerScalingEvent.count({ where: { eventType: 'SCALE_DOWN' } }),
      this.prisma.partnerScalingPolicy.count({ where: { isAutoScalingEnabled: true } }),
      this.prisma.partnerScalingEvent.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { partner: { select: { companyName: true } } },
      }),
    ]);

    const allPolicies = await this.prisma.partnerScalingPolicy.findMany({
      include: { partner: { select: { companyName: true, plan: true } } },
    });

    return { totalScaleUps, totalScaleDowns, enabledPolicies, recentEvents, allPolicies };
  }

  private getCurrentPeriod(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}
