import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import axios from 'axios';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { WlDbProvisioningService } from './wl-db-provisioning.service';

const DEDICATED_DB_PLANS = new Set(['WL_PROFESSIONAL', 'WL_ENTERPRISE']);

export interface PlanCard {
  packageCode: string;
  packageName: string;
  tagline: string | null;
  priceMonthlyInr: number;
  priceYearlyInr: number;
  trialDays: number;
  isPopular: boolean;
  badgeText: string | null;
  color: string | null;
  featureFlags: Record<string, unknown>;
  limits: Record<string, unknown>;
  hasDedicatedDb: boolean;
  tier: number;
}

@Injectable()
export class TenantUpgradeService {
  private readonly logger = new Logger(TenantUpgradeService.name);

  private get rzpKeyId(): string { return process.env.RAZORPAY_KEY_ID ?? ''; }
  private get rzpKeySecret(): string { return process.env.RAZORPAY_KEY_SECRET ?? ''; }

  constructor(
    private readonly prisma: PrismaService,
    private readonly wlProvisioning: WlDbProvisioningService,
  ) {}

  // ─── 1. List available plans ──────────────────────────────────────────────

  async listPlans(): Promise<PlanCard[]> {
    const packages = await this.prisma.platform.subscriptionPackage.findMany({
      where: { isActive: true, isPublic: true },
      orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }],
      select: {
        packageCode: true,
        packageName: true,
        tagline: true,
        priceMonthlyInr: true,
        priceYearlyInr: true,
        trialDays: true,
        isPopular: true,
        badgeText: true,
        color: true,
        featureFlags: true,
        limits: true,
        hasDedicatedDb: true,
        tier: true,
      },
    });

    return packages.map((p) => ({
      ...p,
      priceMonthlyInr: Number(p.priceMonthlyInr),
      priceYearlyInr: Number(p.priceYearlyInr),
      featureFlags: (p.featureFlags as Record<string, unknown>) ?? {},
      limits: (p.limits as Record<string, unknown>) ?? {},
    }));
  }

  // ─── 2. Create Razorpay order ─────────────────────────────────────────────

  async createOrder(
    tenantId: string,
    packageCode: string,
    billingCycle: 'MONTHLY' | 'YEARLY',
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    packageCode: string;
    packageName: string;
  }> {
    if (!this.rzpKeyId || !this.rzpKeySecret) {
      throw new BadRequestException('Payment gateway not configured. Contact support.');
    }

    const pkg = await this.prisma.platform.subscriptionPackage.findFirst({
      where: { packageCode, isActive: true },
    });
    if (!pkg) throw new BadRequestException(`Plan "${packageCode}" not found or inactive.`);

    const amountInr = billingCycle === 'YEARLY' ? Number(pkg.priceYearlyInr) : Number(pkg.priceMonthlyInr);
    if (amountInr <= 0) throw new BadRequestException('Invalid plan amount.');

    const amountPaise = Math.round(amountInr * 100);
    const receipt = `upg_${tenantId.slice(0, 8)}_${Date.now()}`;

    const orderRes = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: { tenantId, packageCode, billingCycle },
      },
      { auth: { username: this.rzpKeyId, password: this.rzpKeySecret } },
    );

    this.logger.log(`Razorpay order created: ${orderRes.data.id} for tenant ${tenantId}`);

    return {
      orderId: orderRes.data.id as string,
      amount: amountPaise,
      currency: 'INR',
      keyId: this.rzpKeyId,
      packageCode,
      packageName: pkg.packageName,
    };
  }

  // ─── 3. Confirm payment + activate plan ──────────────────────────────────

  async confirmPayment(
    tenantId: string,
    orderId: string,
    paymentId: string,
    signature: string,
    packageCode: string,
    billingCycle: 'MONTHLY' | 'YEARLY',
  ): Promise<{ planCode: string; dedicatedDbStarted: boolean }> {
    if (!this.rzpKeySecret) {
      throw new BadRequestException('Payment gateway not configured.');
    }

    const expected = crypto
      .createHmac('sha256', this.rzpKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expected !== signature) {
      throw new UnauthorizedException('Payment signature verification failed.');
    }

    const pkg = await this.prisma.platform.subscriptionPackage.findFirst({
      where: { packageCode, isActive: true },
    });
    if (!pkg) throw new BadRequestException(`Plan "${packageCode}" not found.`);

    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: {
        planCode: pkg.packageCode,
        planId: pkg.id,
        subscriptionStatus: 'ACTIVE',
      } as any,
    });

    this.logger.log(`Tenant ${tenantId} upgraded to plan ${packageCode} (${billingCycle})`);

    let dedicatedDbStarted = false;
    if (pkg.hasDedicatedDb && DEDICATED_DB_PLANS.has(packageCode)) {
      try {
        await this.wlProvisioning.startProvisioning(tenantId);
        dedicatedDbStarted = true;
      } catch (err) {
        // Plan activated — DB provisioning can be retried separately
        this.logger.warn(`DB provisioning skipped for ${tenantId}: ${(err as Error).message}`);
      }
    }

    return { planCode: packageCode, dedicatedDbStarted };
  }

  // ─── 4. Current plan status ───────────────────────────────────────────────

  async getStatus(tenantId: string): Promise<{
    planCode: string | null;
    subscriptionStatus: string;
    dbStrategy: string;
  }> {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { planCode: true, subscriptionStatus: true, dbStrategy: true } as any,
    });
    if (!tenant) throw new BadRequestException('Tenant not found.');
    return {
      planCode: (tenant as any).planCode ?? null,
      subscriptionStatus: (tenant as any).subscriptionStatus ?? 'TRIALING',
      dbStrategy: (tenant as any).dbStrategy ?? 'SHARED',
    };
  }

  // ─── 5. Razorpay webhook processing ──────────────────────────────────────

  async processWebhook(rawBody: string, razorpaySignature: string): Promise<void> {
    if (!this.rzpKeySecret) {
      this.logger.warn('Webhook received but RAZORPAY_KEY_SECRET not set — skipping verification');
      return;
    }

    const expected = crypto
      .createHmac('sha256', this.rzpKeySecret)
      .update(rawBody)
      .digest('hex');

    if (expected !== razorpaySignature) {
      this.logger.warn('Razorpay webhook: signature mismatch — discarding event');
      return;
    }

    const event = JSON.parse(rawBody) as {
      event?: string;
      payload?: { payment?: { entity?: { notes?: Record<string, string> } } };
    };
    const eventType = event?.event ?? '';
    this.logger.log(`Razorpay webhook event: ${eventType}`);

    if (eventType === 'payment.captured') {
      const notes = event?.payload?.payment?.entity?.notes ?? {};
      const { tenantId, packageCode } = notes;
      if (!tenantId || !packageCode) return;

      const pkg = await this.prisma.platform.subscriptionPackage.findFirst({
        where: { packageCode, isActive: true },
      });
      if (!pkg) return;

      await this.prisma.identity.tenant.update({
        where: { id: tenantId },
        data: { planCode: pkg.packageCode, planId: pkg.id, subscriptionStatus: 'ACTIVE' } as any,
      });
      this.logger.log(`Webhook: Tenant ${tenantId} plan activated → ${packageCode}`);
    }
  }
}
