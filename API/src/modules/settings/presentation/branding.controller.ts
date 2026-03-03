import {
  Controller, Get, Put, Post, Body, Param, UseInterceptors,
  UploadedFile, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { BrandingService } from '../services/branding.service';
import { DomainVerifierService } from '../services/domain-verifier.service';
import { UpdateBrandingDto, InitiateDomainDto } from './dto/update-branding.dto';

@ApiTags('Settings - Branding')
@Controller('api/v1/settings/branding')
export class BrandingController {
  constructor(
    private readonly brandingService: BrandingService,
    private readonly domainVerifier: DomainVerifierService,
  ) {}

  /** Get branding (colors, logos, domain). */
  @Get()
  get(@Req() req: any) {
    return this.brandingService.get(req.user.tenantId);
  }

  /** Update branding. */
  @Put()
  update(@Req() req: any, @Body() dto: UpdateBrandingDto) {
    return this.brandingService.update(req.user.tenantId, dto);
  }

  /** Upload logo/favicon/banner. */
  @Post('upload/:type')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
  uploadLogo(
    @Req() req: any,
    @Param('type') type: 'logo' | 'logoLight' | 'favicon' | 'loginBanner' | 'emailHeaderLogo',
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.brandingService.uploadLogo(req.user.tenantId, file, type);
  }

  /** Initiate custom domain verification. */
  @Post('domain/verify')
  initiateDomain(@Req() req: any, @Body() dto: InitiateDomainDto) {
    return this.domainVerifier.initiate(req.user.tenantId, dto.domain);
  }

  /** Check domain verification status. */
  @Get('domain/status')
  verifyDomain(@Req() req: any) {
    return this.domainVerifier.verify(req.user.tenantId);
  }

  /** Reset branding to defaults. */
  @Post('reset')
  reset(@Req() req: any) {
    return this.brandingService.resetToDefaults(req.user.tenantId);
  }

  /** Get CSS variables for frontend consumption. */
  @Get('css-variables')
  getCssVariables(@Req() req: any) {
    return this.brandingService.getCssVariables(req.user.tenantId);
  }
}
