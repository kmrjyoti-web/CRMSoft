import { PrismaService } from '../../../core/prisma/prisma.service';
export declare class VendorService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    register(data: {
        companyName: string;
        contactEmail: string;
        gstNumber?: string;
        revenueSharePct?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/platform-client").$Enums.VendorStatus;
        companyName: string;
        verifiedAt: Date | null;
        supportEmail: string | null;
        password: string | null;
        lastLoginAt: Date | null;
        gstNumber: string | null;
        contactEmail: string;
        contactName: string | null;
        bankAccountEnc: string | null;
        revenueSharePct: import("@prisma/platform-client/runtime/library").Decimal;
        vendorType: import("@prisma/platform-client").$Enums.VendorType;
        aiPluginCount: number;
        websiteUrl: string | null;
    }>;
    approve(vendorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/platform-client").$Enums.VendorStatus;
        companyName: string;
        verifiedAt: Date | null;
        supportEmail: string | null;
        password: string | null;
        lastLoginAt: Date | null;
        gstNumber: string | null;
        contactEmail: string;
        contactName: string | null;
        bankAccountEnc: string | null;
        revenueSharePct: import("@prisma/platform-client/runtime/library").Decimal;
        vendorType: import("@prisma/platform-client").$Enums.VendorType;
        aiPluginCount: number;
        websiteUrl: string | null;
    }>;
    suspend(vendorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/platform-client").$Enums.VendorStatus;
        companyName: string;
        verifiedAt: Date | null;
        supportEmail: string | null;
        password: string | null;
        lastLoginAt: Date | null;
        gstNumber: string | null;
        contactEmail: string;
        contactName: string | null;
        bankAccountEnc: string | null;
        revenueSharePct: import("@prisma/platform-client/runtime/library").Decimal;
        vendorType: import("@prisma/platform-client").$Enums.VendorType;
        aiPluginCount: number;
        websiteUrl: string | null;
    }>;
    listAll(query?: {
        page?: string;
        limit?: string;
        status?: string;
        search?: string;
    }): Promise<{
        data: ({
            _count: {
                modules: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/platform-client").$Enums.VendorStatus;
            companyName: string;
            verifiedAt: Date | null;
            supportEmail: string | null;
            password: string | null;
            lastLoginAt: Date | null;
            gstNumber: string | null;
            contactEmail: string;
            contactName: string | null;
            bankAccountEnc: string | null;
            revenueSharePct: import("@prisma/platform-client/runtime/library").Decimal;
            vendorType: import("@prisma/platform-client").$Enums.VendorType;
            aiPluginCount: number;
            websiteUrl: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string): Promise<{
        _count: {
            modules: number;
        };
        modules: {
            id: string;
            status: import("@prisma/platform-client").$Enums.MarketplaceModuleStatus;
            moduleName: string;
            moduleCode: string;
            installCount: number;
            avgRating: import("@prisma/platform-client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/platform-client").$Enums.VendorStatus;
        companyName: string;
        verifiedAt: Date | null;
        supportEmail: string | null;
        password: string | null;
        lastLoginAt: Date | null;
        gstNumber: string | null;
        contactEmail: string;
        contactName: string | null;
        bankAccountEnc: string | null;
        revenueSharePct: import("@prisma/platform-client/runtime/library").Decimal;
        vendorType: import("@prisma/platform-client").$Enums.VendorType;
        aiPluginCount: number;
        websiteUrl: string | null;
    }>;
}
