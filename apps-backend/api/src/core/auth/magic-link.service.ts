import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformConsolePrismaService } from '../../modules/platform-console/prisma/platform-console-prisma.service';
import { RedisCacheService } from '../../modules/core/cache/cache.service';
import { MappingService } from './mapping.service';

const MAGIC_LINK_TTL = 600;    // 10 minutes — token validity
const RATE_LIMIT_TTL = 3600;   // 1 hour
const RATE_LIMIT_MAX = 3;
const SSO_TTL = 60;            // 60 seconds — one-time redirect token
const SESSION_TTL = 600;       // 10 minutes — tenant selection window
const CENTRAL_APP_URL = process.env.CENTRAL_APP_URL ?? 'https://app.crmsoft.com';
const MAGIC_LINK_BASE_URL = process.env.MAGIC_LINK_BASE_URL ?? 'http://localhost:3000';

interface MagicTokenPayload {
  userId: string;
  email: string;
  createdAt: string;
}

@Injectable()
export class MagicLinkService {
  private readonly logger = new Logger(MagicLinkService.name);
  private readonly memStore = new Map<string, { raw: string; expiresAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly pcDb: PlatformConsolePrismaService,
    private readonly cache: RedisCacheService,
    private readonly mapping: MappingService,
  ) {}

  // ── A. Send magic link to email ──────────────────────────────────

  async sendMagicLink(email: string): Promise<{ sent: boolean; message: string }> {
    const user = await this.prisma.identity.user.findFirst({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, firstName: true, status: true } as any,
    });

    // Always return the same message to prevent email enumeration
    const genericResponse = {
      sent: true,
      message: 'If this email is registered, a sign-in link has been sent. Check your inbox — link valid for 10 minutes.',
    };

    if (!user || (user as any).status === 'SUSPENDED') return genericResponse;

    // Rate limit: max 3 per email per hour
    const rateKey = `magic-rate:${email.toLowerCase()}`;
    const count = (await this.cache.get<number>(rateKey)) ?? 0;
    if (count >= RATE_LIMIT_MAX) {
      return {
        sent: false,
        message: 'Too many sign-in requests. Please try again in 1 hour.',
      };
    }
    await this.cache.set(rateKey, count + 1, RATE_LIMIT_TTL);

    const token = randomUUID();
    const payload: MagicTokenPayload = {
      userId: (user as any).id,
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    await this.tokenSet(`magic-link:${token}`, payload, MAGIC_LINK_TTL);

    const magicUrl = `${MAGIC_LINK_BASE_URL}/magic?token=${token}`;
    const firstName = (user as any).firstName ?? 'there';

    // In dev/no-email-service mode: log the link
    this.logger.log(`[MAGIC LINK] To: ${email} | URL: ${magicUrl}`);

    await this.sendEmail(email, firstName, magicUrl).catch((err) =>
      this.logger.warn(`Magic link email failed for ${email}: ${(err as Error).message}`),
    );

    return genericResponse;
  }

  // ── B. Verify magic link token → issue SSO or session ───────────

  async verifyMagicLink(token: string): Promise<
    | { type: 'SINGLE'; ssoToken: string; redirectUrl: string }
    | { type: 'MULTI'; sessionToken: string; companies: unknown[] }
    | { type: 'NO_COMPANY'; message: string }
    | { type: 'INVALID'; reason: string }
  > {
    const payload = await this.tokenGet<MagicTokenPayload>(`magic-link:${token}`);

    if (!payload) {
      return { type: 'INVALID', reason: 'Sign-in link has expired or already been used.' };
    }

    // Delete immediately — one-time use
    await this.tokenDel(`magic-link:${token}`);

    const user = await this.prisma.identity.user.findUnique({
      where: { id: payload.userId },
      include: { role: true },
    });

    if (!user || (user as any).status === 'SUSPENDED') {
      return { type: 'INVALID', reason: 'Account not found or suspended.' };
    }

    await this.prisma.identity.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const companies = await this.mapping.getUserCompanies(user.id);

    if (companies.length === 0) {
      return { type: 'NO_COMPANY', message: 'No active company found. Please contact support.' };
    }

    if (companies.length === 1) {
      const m = companies[0];
      const { ssoToken, redirectUrl } = await this.generateSsoToken(
        user.id, m.company.id, m.company.brandCode ?? null,
      );
      return { type: 'SINGLE', ssoToken, redirectUrl };
    }

    // Multi-company: issue session token for tenant picker
    const sessionToken = randomUUID();
    await this.tokenSet(`central-session:${sessionToken}`, {
      userId: user.id,
      authenticatedAt: new Date().toISOString(),
    }, SESSION_TTL);

    const companiesList = await this.buildTenantList(companies);
    return { type: 'MULTI', sessionToken, companies: companiesList };
  }

  // ── C. Generate SSO redirect token (same pattern as CentralAuthService) ─────

  private async generateSsoToken(userId: string, companyId: string, brandCode: string | null) {
    const tenant = brandCode
      ? await this.prisma.identity.tenant.findFirst({
          where: { brandCode },
          select: { domain: true, subdomain: true },
        })
      : null;

    const ssoToken = randomUUID();
    await this.tokenSet(`sso:${ssoToken}`, {
      userId, companyId, brandCode,
      createdAt: new Date().toISOString(),
    }, SSO_TTL);

    const portalDomain = tenant?.domain ?? tenant?.subdomain ?? null;
    const redirectUrl = portalDomain
      ? `https://${portalDomain}?sso=${ssoToken}`
      : `${CENTRAL_APP_URL}/sso/callback?token=${ssoToken}`;

    return { ssoToken, redirectUrl };
  }

  // ── D. Build company list for tenant picker ─────────────────────

  private async buildTenantList(companies: any[]) {
    return Promise.all(companies.map(async (m) => {
      const company = m.company;
      const [brandProfile, tenant] = await Promise.all([
        company.brandCode
          ? this.pcDb.brandProfile.findUnique({
              where: { brandCode: company.brandCode },
              select: { brandName: true, logoUrl: true },
            }).catch(() => null)
          : Promise.resolve(null),
        company.brandCode
          ? this.prisma.identity.tenant.findFirst({
              where: { brandCode: company.brandCode },
              select: { id: true, domain: true, subdomain: true, planCode: true },
            }).catch(() => null)
          : Promise.resolve(null),
      ]);

      return {
        tenantId: tenant?.id ?? null,
        companyId: company.id,
        companyName: company.name,
        brandCode: company.brandCode ?? null,
        brandName: brandProfile?.brandName ?? null,
        logoUrl: brandProfile?.logoUrl ?? null,
        domain: tenant?.domain ?? null,
        subdomain: tenant?.subdomain ?? null,
        role: m.role,
      };
    }));
  }

  // ── E. Email delivery (dev: console.log) ────────────────────────

  private async sendEmail(email: string, name: string, magicUrl: string): Promise<void> {
    const smtpHost = process.env.SMTP_HOST;

    if (!smtpHost) {
      // No email service configured — magic link already logged above
      return;
    }

    // Future: integrate nodemailer / MSG91 / SendGrid here
    // For now, always falls back to console log since no transporter is configured
    this.logger.debug(`[EMAIL] Magic link to ${email}: ${magicUrl}`);
  }

  // ── Dual-store token helpers (Redis + in-memory fallback) ────────

  private async tokenSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const raw = JSON.stringify(value);
    this.memStore.set(key, { raw, expiresAt: Date.now() + ttlSeconds * 1000 });
    setTimeout(() => this.memStore.delete(key), (ttlSeconds + 1) * 1000);
    await this.cache.set(key, value, ttlSeconds);
  }

  private async tokenGet<T>(key: string): Promise<T | null> {
    const redisResult = await this.cache.get<T>(key);
    if (redisResult !== null) return redisResult;

    const entry = this.memStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memStore.delete(key);
      return null;
    }
    try {
      return JSON.parse(entry.raw) as T;
    } catch {
      return null;
    }
  }

  private async tokenDel(key: string): Promise<void> {
    this.memStore.delete(key);
    await this.cache.del(key);
  }
}
