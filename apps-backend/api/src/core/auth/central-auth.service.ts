import {
  Injectable, UnauthorizedException, BadRequestException, Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformConsolePrismaService } from '../../modules/platform-console/prisma/platform-console-prisma.service';
import { RedisCacheService } from '../../modules/core/cache/cache.service';
import { AuthService } from './auth.service';
import { MappingService } from './mapping.service';

const CENTRAL_APP_URL = process.env.CENTRAL_APP_URL ?? 'https://app.crmsoft.com';

const SSO_TTL = 60;        // 60 seconds — one-time redirect token
const SESSION_TTL = 600;   // 10 minutes — tenant selection window
const RATE_LIMIT_TTL = 3600; // 1 hour
const RATE_LIMIT_MAX = 10;

interface SsoPayload {
  userId: string;
  companyId: string;
  brandCode: string | null;
  createdAt: string;
}

interface SessionPayload {
  userId: string;
  authenticatedAt: string;
}

@Injectable()
export class CentralAuthService {
  private readonly logger = new Logger(CentralAuthService.name);

  // In-memory fallback store for when Redis is unavailable (dev mode)
  private readonly memStore = new Map<string, { raw: string; expiresAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly pcDb: PlatformConsolePrismaService,
    private readonly cache: RedisCacheService,
    private readonly authService: AuthService,
    private readonly mapping: MappingService,
  ) {}

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Central Login — returns SSO (single) or tenant list (multi)
  // ═══════════════════════════════════════════════════════════════

  async centralLogin(email: string, password: string) {
    await this.checkRateLimit(email);

    const user = await this.prisma.identity.user.findFirst({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      await this.incrementRateLimit(email);
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account inactive or suspended');
    }

    const valid = await bcrypt.compare(password, (user as any).password);
    if (!valid) {
      await this.incrementRateLimit(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.identity.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const companies = await this.mapping.getUserCompanies(user.id);

    if (companies.length === 0) {
      return {
        type: 'NO_COMPANY',
        message: 'No active company found. Please contact support.',
      };
    }

    if (companies.length === 1) {
      const m = companies[0];
      const { ssoToken, redirectUrl } = await this.generateSsoToken(
        user.id, m.company.id, m.company.brandCode ?? null,
      );
      return { type: 'SINGLE', ssoToken, redirectUrl };
    }

    // Multi-company: generate session token for tenant selection
    const sessionToken = randomUUID();
    await this.tokenSet(`central-session:${sessionToken}`, {
      userId: user.id,
      authenticatedAt: new Date().toISOString(),
    } satisfies SessionPayload, SESSION_TTL);

    const tenants = await this.buildTenantList(companies);
    return { type: 'MULTI', sessionToken, tenants };
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Select Tenant — exchange session token for SSO token
  // ═══════════════════════════════════════════════════════════════

  async selectTenant(sessionToken: string, companyId: string) {
    const session = await this.tokenGet<SessionPayload>(`central-session:${sessionToken}`);
    if (!session) throw new UnauthorizedException('Session expired or invalid');

    const isMember = await this.mapping.verifyMembership(session.userId, companyId);
    if (!isMember) throw new UnauthorizedException('Not a member of this company');

    const mappingRecord = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: { userId: session.userId, companyId, status: 'ACTIVE', isDeleted: false },
      include: { company: true },
    });
    const brandCode: string | null = mappingRecord?.company?.brandCode ?? null;

    const { ssoToken, redirectUrl } = await this.generateSsoToken(session.userId, companyId, brandCode);

    // One-time use — delete session
    await this.tokenDel(`central-session:${sessionToken}`);

    return { ssoToken, redirectUrl };
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: SSO Verify — exchange SSO token for brand portal JWT
  // ═══════════════════════════════════════════════════════════════

  async verifySso(ssoToken: string) {
    const data = await this.tokenGet<SsoPayload>(`sso:${ssoToken}`);
    if (!data) throw new UnauthorizedException('SSO token invalid or expired');

    // One-time use — delete immediately
    await this.tokenDel(`sso:${ssoToken}`);

    // Parallel: issue JWT + fetch mapping for company details
    const [tokens, mapping, user] = await Promise.all([
      this.authService.switchCompany(data.userId, data.companyId),
      (this.prisma.identity as any).userCompanyMapping.findFirst({
        where: { userId: data.userId, companyId: data.companyId, status: 'ACTIVE', isDeleted: false },
        include: { company: true },
      }),
      this.prisma.identity.user.findFirst({
        where: { id: data.userId },
        include: { role: true },
      }),
    ]);

    if (!user) throw new UnauthorizedException('User not found');

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        role: user.role.name,
        userType: user.userType,
      },
      company: {
        id: data.companyId,
        name: mapping?.company?.name ?? '',
        brandCode: mapping?.company?.brandCode ?? data.brandCode,
        verticalCode: mapping?.company?.verticalCode ?? null,
        role: mapping?.role ?? 'MEMBER',
        isDefault: mapping?.isDefault ?? false,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Private helpers
  // ═══════════════════════════════════════════════════════════════

  private async generateSsoToken(userId: string, companyId: string, brandCode: string | null) {
    const tenant = brandCode
      ? await this.prisma.identity.tenant.findFirst({
          where: { brandCode },
          select: { domain: true, subdomain: true },
        })
      : null;

    const ssoToken = randomUUID();
    await this.tokenSet(`sso:${ssoToken}`, {
      userId,
      companyId,
      brandCode,
      createdAt: new Date().toISOString(),
    } satisfies SsoPayload, SSO_TTL);

    const portalDomain = tenant?.domain ?? tenant?.subdomain ?? null;
    const redirectUrl = portalDomain
      ? `https://${portalDomain}?sso=${ssoToken}`
      : `${CENTRAL_APP_URL}/sso/callback?token=${ssoToken}`;

    return { ssoToken, redirectUrl };
  }

  private async buildTenantList(companies: any[]) {
    return Promise.all(
      companies.map(async (m) => {
        const company = m.company;

        const [brandProfile, tenant] = await Promise.all([
          company.brandCode
            ? this.pcDb.brandProfile
                .findUnique({
                  where: { brandCode: company.brandCode },
                  select: { brandName: true, logoUrl: true },
                })
                .catch(() => null)
            : Promise.resolve(null),
          company.brandCode
            ? this.prisma.identity.tenant
                .findFirst({
                  where: { brandCode: company.brandCode },
                  select: { id: true, domain: true, subdomain: true, planCode: true, verticalCode: true },
                })
                .catch(() => null)
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
          verticalName: tenant?.verticalCode ?? company.verticalCode ?? null,
          planCode: tenant?.planCode ?? null,
        };
      }),
    );
  }

  private async checkRateLimit(email: string): Promise<void> {
    const key = `central-rate:${email.toLowerCase()}`;
    const count = (await this.cache.get<number>(key)) ?? 0;
    if (count >= RATE_LIMIT_MAX) {
      throw new BadRequestException('Too many login attempts. Please try again in 1 hour.');
    }
  }

  private async incrementRateLimit(email: string): Promise<void> {
    const key = `central-rate:${email.toLowerCase()}`;
    const count = ((await this.cache.get<number>(key)) ?? 0) + 1;
    await this.cache.set(key, count, RATE_LIMIT_TTL);
  }

  // ─── Dual-store token helpers (Redis + in-memory fallback for dev mode) ───

  private async tokenSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    // Always store in memory as dev fallback
    const raw = JSON.stringify(value);
    this.memStore.set(key, { raw, expiresAt: Date.now() + ttlSeconds * 1000 });
    setTimeout(() => this.memStore.delete(key), (ttlSeconds + 1) * 1000);

    // Also persist to Redis (no-op on failure)
    const redisBefore = await this.cache.get<unknown>(key);
    await this.cache.set(key, value, ttlSeconds);
    const redisAfter = await this.cache.get<unknown>(key);
    if (redisBefore === null && redisAfter === null) {
      this.logger.warn('Redis not available, using in-memory SSO tokens');
    }
  }

  private async tokenGet<T>(key: string): Promise<T | null> {
    const redisResult = await this.cache.get<T>(key);
    if (redisResult !== null) return redisResult;

    // Fallback to in-memory
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
