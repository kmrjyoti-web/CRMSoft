import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { TenantBranding } from '@prisma/identity-client';
type LogoType = 'logo' | 'logoLight' | 'favicon' | 'loginBanner' | 'emailHeaderLogo';
export declare class BrandingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    get(tenantId: string): Promise<TenantBranding>;
    getByDomain(domain: string): Promise<TenantBranding | null>;
    update(tenantId: string, data: Partial<TenantBranding>): Promise<TenantBranding>;
    uploadLogo(tenantId: string, file: Express.Multer.File, type: LogoType): Promise<{
        url: string;
    }>;
    resetToDefaults(tenantId: string): Promise<void>;
    getCssVariables(tenantId: string): Promise<Record<string, string>>;
}
export {};
