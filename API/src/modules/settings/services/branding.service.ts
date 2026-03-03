import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TenantBranding } from '@prisma/client';
import { AppError } from '../../../common/errors/app-error';
import * as path from 'path';
import * as fs from 'fs';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

type LogoType = 'logo' | 'logoLight' | 'favicon' | 'loginBanner' | 'emailHeaderLogo';

const LOGO_FIELD_MAP: Record<LogoType, keyof TenantBranding> = {
  logo: 'logoUrl',
  logoLight: 'logoLightUrl',
  favicon: 'faviconUrl',
  loginBanner: 'loginBannerUrl',
  emailHeaderLogo: 'emailHeaderLogoUrl',
};

@Injectable()
export class BrandingService {
  private readonly logger = new Logger(BrandingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get branding for a tenant (with defaults). */
  async get(tenantId: string): Promise<TenantBranding> {
    const branding = await this.prisma.tenantBranding.findUnique({ where: { tenantId } });
    if (!branding) throw AppError.from('CONFIG_ERROR');
    return branding;
  }

  /** Get branding by custom domain (for login page resolution). */
  async getByDomain(domain: string): Promise<TenantBranding | null> {
    return this.prisma.tenantBranding.findFirst({
      where: { customDomain: domain, domainVerified: true },
    });
  }

  /** Update branding fields. */
  async update(tenantId: string, data: Partial<TenantBranding>): Promise<TenantBranding> {
    return this.prisma.tenantBranding.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data } as any,
    });
  }

  /** Upload a logo/favicon/banner file. */
  async uploadLogo(
    tenantId: string,
    file: Express.Multer.File,
    type: LogoType,
  ): Promise<{ url: string }> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw AppError.from('VALIDATION_ERROR');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw AppError.from('VALIDATION_ERROR');
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'branding', tenantId);
    fs.mkdirSync(uploadDir, { recursive: true });

    const ext = path.extname(file.originalname) || '.png';
    const filename = `${type}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    const url = `/uploads/branding/${tenantId}/${filename}`;
    const field = LOGO_FIELD_MAP[type];
    await this.prisma.tenantBranding.upsert({
      where: { tenantId },
      update: { [field]: url },
      create: { tenantId, [field]: url } as any,
    });

    return { url };
  }

  /** Reset branding to default values. */
  async resetToDefaults(tenantId: string): Promise<void> {
    await this.prisma.tenantBranding.delete({ where: { tenantId } }).catch(() => {});
    await this.prisma.tenantBranding.create({ data: { tenantId } });
  }

  /** Generate CSS variables for the frontend to consume. */
  async getCssVariables(tenantId: string): Promise<Record<string, string>> {
    const b = await this.get(tenantId);
    return {
      '--primary': b.primaryColor,
      '--secondary': b.secondaryColor,
      '--accent': b.accentColor,
      '--sidebar-bg': b.sidebarColor,
      '--sidebar-text': b.sidebarTextColor,
      '--header-bg': b.headerColor,
      '--header-text': b.headerTextColor,
      '--button-bg': b.buttonColor,
      '--button-text': b.buttonTextColor,
      '--link': b.linkColor,
      '--danger': b.dangerColor,
      '--success': b.successColor,
      '--warning': b.warningColor,
      '--font-family': b.fontFamily,
      '--heading-font': b.headingFontFamily ?? b.fontFamily,
      '--font-size': b.fontSize,
    };
  }
}
