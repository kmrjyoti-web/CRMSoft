import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { RedisCacheService } from '../../../cache/cache.service';

const CACHE_TTL = 300; // 5 minutes

export interface ResolvedTenant {
  id: string;
  slug: string;
  dbStrategy: string;
  planCode: string | null;
  partnerCode: string | null;
  brandCode: string | null;
  editionCode: string | null;
  verticalCode: string | null;
}

/** In-memory fallback used when Redis is unavailable (dev / offline mode) */
const memCache = new Map<string, { value: ResolvedTenant; expiresAt: number }>();

function memGet(key: string): ResolvedTenant | null {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { memCache.delete(key); return null; }
  return entry.value;
}
function memSet(key: string, value: ResolvedTenant) {
  memCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL * 1000 });
}

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantResolverMiddleware.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      const tenant = await this.resolveTenant(req);
      if (tenant) (req as any)['tenant'] = tenant;
    } catch (err: any) {
      this.logger.warn(`TenantResolver failed: ${err.message}`);
    }
    next();
  }

  private async resolveTenant(req: Request): Promise<ResolvedTenant | null> {
    // 1. Explicit header (API integrations / mobile apps)
    const headerTenantId = req.headers['x-tenant-id'] as string | undefined;
    if (headerTenantId) return this.loadById(headerTenantId);

    // 2. Host-based resolution (WL domain or subdomain)
    const host = (req.headers['host'] as string | undefined)?.split(':')[0]?.toLowerCase();
    if (host) {
      const byDomain = await this.loadByHost(host);
      if (byDomain) return byDomain;
    }

    // 3. JWT soft-decode — extract tenantId without verification (guard will verify later)
    const authHeader = req.headers['authorization'] as string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      const tenantId = this.extractTenantIdFromJwt(authHeader.slice(7));
      if (tenantId) return this.loadById(tenantId);
    }

    return null;
  }

  private extractTenantIdFromJwt(token: string): string | null {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
      return payload?.tenantId ?? null;
    } catch {
      return null;
    }
  }

  private async loadByHost(host: string): Promise<ResolvedTenant | null> {
    const cacheKey = `tenant:host:${host}`;

    const cached = await this.cache.get<ResolvedTenant>(cacheKey) ?? memGet(cacheKey);
    if (cached) return cached;

    // Try exact custom domain first, then subdomain
    const tenant = await this.prisma.identity.tenant.findFirst({
      where: {
        OR: [{ domain: host }, { subdomain: host }],
      },
      select: {
        id: true, slug: true, dbStrategy: true,
        planCode: true, partnerCode: true,
        brandCode: true, editionCode: true, verticalCode: true,
      },
    });

    if (!tenant) return null;
    const resolved = this.toResolved(tenant);
    await this.cache.set(cacheKey, resolved, CACHE_TTL);
    memSet(cacheKey, resolved);
    return resolved;
  }

  private async loadById(id: string): Promise<ResolvedTenant | null> {
    const cacheKey = `tenant:id:${id}`;

    const cached = await this.cache.get<ResolvedTenant>(cacheKey) ?? memGet(cacheKey);
    if (cached) return cached;

    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id },
      select: {
        id: true, slug: true, dbStrategy: true,
        planCode: true, partnerCode: true,
        brandCode: true, editionCode: true, verticalCode: true,
      },
    });

    if (!tenant) return null;
    const resolved = this.toResolved(tenant);
    await this.cache.set(cacheKey, resolved, CACHE_TTL);
    memSet(cacheKey, resolved);
    return resolved;
  }

  private toResolved(t: {
    id: string; slug: string; dbStrategy: string;
    planCode: string | null; partnerCode: string | null;
    brandCode: string | null; editionCode: string | null; verticalCode: string | null;
  }): ResolvedTenant {
    return {
      id: t.id,
      slug: t.slug,
      dbStrategy: t.dbStrategy,
      planCode: t.planCode,
      partnerCode: t.partnerCode,
      brandCode: t.brandCode,
      editionCode: t.editionCode,
      verticalCode: t.verticalCode,
    };
  }
}
