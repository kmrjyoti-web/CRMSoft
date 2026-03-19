import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { randomBytes } from 'crypto';
import { AppError } from '../../../../../common/errors/app-error';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

@Injectable()
export class DomainVerifierService {
  private readonly logger = new Logger(DomainVerifierService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Initiate custom domain verification for a tenant. */
  async initiate(
    tenantId: string,
    domain: string,
  ): Promise<{ domain: string; verifyMethod: string; verifyToken: string; instructions: string }> {
    const token = `crm-verify-${randomBytes(16).toString('hex')}`;

    await this.prisma.tenantBranding.upsert({
      where: { tenantId },
      update: {
        customDomain: domain,
        domainVerified: false,
        domainVerifyToken: token,
        domainVerifyMethod: 'DNS_TXT',
      },
      create: {
        tenantId,
        customDomain: domain,
        domainVerifyToken: token,
        domainVerifyMethod: 'DNS_TXT',
      },
    });

    return {
      domain,
      verifyMethod: 'DNS_TXT',
      verifyToken: token,
      instructions: `Add a DNS TXT record: _crm-verify.${domain} → ${token}`,
    };
  }

  /** Check if the domain TXT record matches the stored token. */
  async verify(tenantId: string): Promise<{ verified: boolean; error?: string }> {
    const branding = await this.prisma.tenantBranding.findUnique({ where: { tenantId } });
    if (!branding?.customDomain || !branding.domainVerifyToken) {
      throw AppError.from('CONFIG_ERROR');
    }

    try {
      const records = await resolveTxt(`_crm-verify.${branding.customDomain}`);
      const flat = records.flat();
      const found = flat.includes(branding.domainVerifyToken);

      if (found) {
        await this.prisma.tenantBranding.update({
          where: { tenantId },
          data: { domainVerified: true },
        });
        this.logger.log(`Domain verified: ${branding.customDomain}`);
        return { verified: true };
      }

      return { verified: false, error: 'TXT record not found. Allow up to 48 hours for DNS propagation.' };
    } catch (err) {
      return { verified: false, error: `DNS lookup failed: ${(err as Error).message}` };
    }
  }
}
