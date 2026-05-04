import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import * as dns from 'dns';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RedisCacheService } from '../cache/cache.service';

const WL_BASE_DOMAIN = process.env.WL_BASE_DOMAIN ?? 'wl.crmsoft.com';
const WL_SUBDOMAIN_BASE = process.env.WL_SUBDOMAIN_BASE ?? 'crmsoft.com';

// RFC-1123 hostname regex — rejects IPs, localhost, single-label names
const DOMAIN_REGEX =
  /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})*\.[a-zA-Z]{2,}$/;

@Injectable()
export class WlDomainService {
  private readonly logger = new Logger(WlDomainService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  // ─── Domain Management ────────────────────────────────────────────────────

  async setDomain(tenantId: string, domain: string) {
    const normalized = domain.toLowerCase().trim();
    if (!this.isValidDomain(normalized)) {
      throw new BadRequestException(
        'Invalid domain format. Must be a valid hostname (no IP, no localhost, min one dot).',
      );
    }

    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true, domain: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const cnameTarget = this.getCnameTarget(tenant.slug);

    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: { domain: normalized, domainVerified: false },
    });

    // Bust old domain cache
    if (tenant.domain && tenant.domain !== normalized) {
      await this.cache.invalidate(`tenant:host:${tenant.domain}`);
      await this.cache.invalidate(`brand-config:raw:${tenant.domain}`);
    }

    return {
      status: 'PENDING_VERIFICATION',
      domain: normalized,
      cnameTarget,
      instructions: [
        `Add a CNAME DNS record for your domain:`,
        `  Name (host): ${normalized}`,
        `  Value (target): ${cnameTarget}`,
        `DNS propagation can take up to 48 hours.`,
        `Then call POST .../domain/verify to confirm.`,
      ].join('\n'),
    };
  }

  async verifyDomain(tenantId: string): Promise<{
    status: 'VERIFIED' | 'PENDING' | 'FAILED';
    domain: string | null;
    cnameTarget: string;
    resolvedAddresses?: string[];
    error?: string;
  }> {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true, domain: true, domainVerified: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    if (!tenant.domain) throw new BadRequestException('No domain configured for this tenant');

    const cnameTarget = this.getCnameTarget(tenant.slug);

    try {
      const addresses = await dns.promises.resolveCname(tenant.domain);
      const verified = addresses.some(
        (a) => a.toLowerCase() === cnameTarget.toLowerCase() || a.toLowerCase() === cnameTarget.toLowerCase() + '.',
      );

      if (verified) {
        await this.prisma.identity.tenant.update({
          where: { id: tenantId },
          data: { domainVerified: true },
        });
        // Refresh resolver cache so the domain works immediately
        await this.cache.invalidate(`tenant:host:${tenant.domain}`);
        await this.cache.invalidate(`brand-config:raw:${tenant.domain}`);
        this.logger.log(`Domain verified: ${tenant.domain} → ${cnameTarget}`);
      }

      return {
        status: verified ? 'VERIFIED' : 'PENDING',
        domain: tenant.domain,
        cnameTarget,
        resolvedAddresses: addresses,
      };
    } catch (err: any) {
      // DNS NXDOMAIN / NOTFOUND → record not yet created
      return {
        status: 'FAILED',
        domain: tenant.domain,
        cnameTarget,
        error: `DNS lookup failed: ${err.message}`,
      };
    }
  }

  async removeDomain(tenantId: string) {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { domain: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const oldDomain = tenant.domain;
    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: { domain: null, domainVerified: false },
    });

    if (oldDomain) {
      await this.cache.invalidate(`tenant:host:${oldDomain}`);
      await this.cache.invalidate(`brand-config:raw:${oldDomain}`);
    }

    return { success: true, removedDomain: oldDomain };
  }

  async getDomainStatus(tenantId: string) {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true, domain: true, subdomain: true, domainVerified: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    return {
      domain: tenant.domain,
      domainVerified: tenant.domainVerified,
      subdomain: tenant.subdomain,
      cnameTarget: tenant.domain ? this.getCnameTarget(tenant.slug) : null,
      instructions: tenant.domain
        ? `CNAME: ${tenant.domain} → ${this.getCnameTarget(tenant.slug)}`
        : null,
    };
  }

  // ─── Subdomain Auto-Setup (System 3) ─────────────────────────────────────

  /**
   * Auto-generates subdomain from partnerCode (or slug).
   * XTREME → xtreme.crmsoft.com (wildcard *.crmsoft.com — no DNS setup needed).
   */
  async setupSubdomain(tenantId: string): Promise<{ subdomain: string }> {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true, partnerCode: true, subdomain: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    // Sanitize: lowercase, only a-z 0-9 hyphen
    const prefix = ((tenant.partnerCode ?? tenant.slug) as string)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const subdomain = `${prefix}.${WL_SUBDOMAIN_BASE}`;

    if (tenant.subdomain === subdomain) return { subdomain };

    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: { subdomain },
    });

    // Bust old subdomain cache if it changed
    if (tenant.subdomain && tenant.subdomain !== subdomain) {
      await this.cache.invalidate(`tenant:host:${tenant.subdomain}`);
    }

    this.logger.log(`Subdomain set for tenant ${tenantId}: ${subdomain}`);
    return { subdomain };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private getCnameTarget(slug: string): string {
    return `${slug}.${WL_BASE_DOMAIN}`;
  }

  private isValidDomain(domain: string): boolean {
    if (!domain || domain === 'localhost') return false;
    // Reject bare IP addresses
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) return false;
    return DOMAIN_REGEX.test(domain);
  }
}
