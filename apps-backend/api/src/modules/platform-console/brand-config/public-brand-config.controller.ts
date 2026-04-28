import {
  Controller, Get, Query, Req, HttpException, HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/roles.decorator';
import { BrandConfigService } from './brand-config.service';
import { BrandConfigSecurityService } from './brand-config-security.service';

@ApiTags('Public')
@Public()
@Controller('public/brand-config')
export class PublicBrandConfigController {
  constructor(
    private readonly service: BrandConfigService,
    private readonly security: BrandConfigSecurityService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch signed + encrypted brand config for a domain (no auth required)',
    description:
      'Response includes AES-256-GCM encrypted payload plus cleartext _meta with SHA256 hash ' +
      'and RSA-SHA256 signature. Verify integrity with GET /public/brand-config/public-key.',
  })
  @ApiQuery({ name: 'domain', required: true, example: 'crm.xtremesoftware.com' })
  async getBrandConfig(@Query('domain') domain: string, @Req() req: Request) {
    if (!domain) {
      throw new HttpException('domain query param is required', HttpStatus.BAD_REQUEST);
    }

    const normalized = domain.toLowerCase().trim();

    // Rate limit: 12 requests/hour per domain
    if (!this.security.checkRateLimit(normalized)) {
      throw new HttpException(
        { error: 'Too many requests. Max 12 requests/hour per domain.', retryAfterSeconds: 3600 },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Fetch raw config (Redis-cached)
    const raw = await this.service.getRawBrandConfig(normalized);

    // Origin/Referer validation (production only)
    const allowed = this.security.validateOrigin(
      req.headers['origin'] as string | undefined,
      req.headers['referer'] as string | undefined,
      raw._domain.domain,
      raw._domain.subdomain,
    );
    if (!allowed) {
      throw new HttpException(
        'Origin not permitted for this tenant domain',
        HttpStatus.FORBIDDEN,
      );
    }

    // Strip internal routing hint before signing
    const { _domain, ...configBody } = raw;

    return this.security.secureConfig(configBody, _domain.tenantId);
  }

  @Get('public-key')
  @ApiOperation({
    summary: 'RSA public key for verifying brand config signatures',
    description: 'Returns PEM-encoded RSA-2048 public key. Verify: RSA-SHA256 on _meta.configHash.',
  })
  getPublicKey() {
    return { publicKey: this.security.getPublicKey(), algorithm: 'RSA-SHA256', keyType: 'RSA-2048' };
  }

  @Get('visual')
  @ApiOperation({
    summary: 'Visual-only brand metadata for a domain (no auth, no encryption)',
    description: 'Returns logo, colors, display name — safe for login page branding. No sensitive config.',
  })
  @ApiQuery({ name: 'domain', required: true, example: 'xtreme.crmsoft.com' })
  async getVisualBranding(@Query('domain') domain: string) {
    if (!domain) {
      throw new HttpException('domain query param is required', HttpStatus.BAD_REQUEST);
    }
    return this.service.getVisualBranding(domain.toLowerCase().trim());
  }
}
