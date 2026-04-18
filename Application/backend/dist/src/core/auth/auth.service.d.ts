import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TenantProvisioningService } from '../../modules/core/identity/tenant/services/tenant-provisioning.service';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private tenantProvisioning;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, tenantProvisioning: TenantProvisioningService);
    adminLogin(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            referralCode?: string | undefined;
            commissionRate?: import("@prisma/identity-client/runtime/library").Decimal | undefined;
            totalReferrals?: number | undefined;
            profile?: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
                deletedById: string | null;
                updatedById: string | null;
                updatedByName: string | null;
                companyName: string | null;
                notes: string | null;
                industry: string | null;
                billingAddress: string | null;
                city: string | null;
                state: string | null;
                pincode: string | null;
                country: string | null;
                gstNumber: string | null;
                userId: string;
            } | undefined;
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            userType: any;
            role: any;
            roleDisplayName: any;
        };
        tenant: {
            id: string;
            name: string;
            status: import("@prisma/identity-client").$Enums.TenantStatus;
            industryCode: string | null;
            slug: string;
            onboardingStep: import("@prisma/identity-client").$Enums.OnboardingStep;
        } | undefined;
    }>;
    employeeLogin(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            referralCode?: string | undefined;
            commissionRate?: import("@prisma/identity-client/runtime/library").Decimal | undefined;
            totalReferrals?: number | undefined;
            profile?: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
                deletedById: string | null;
                updatedById: string | null;
                updatedByName: string | null;
                companyName: string | null;
                notes: string | null;
                industry: string | null;
                billingAddress: string | null;
                city: string | null;
                state: string | null;
                pincode: string | null;
                country: string | null;
                gstNumber: string | null;
                userId: string;
            } | undefined;
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            userType: any;
            role: any;
            roleDisplayName: any;
        };
        tenant: {
            id: string;
            name: string;
            status: import("@prisma/identity-client").$Enums.TenantStatus;
            industryCode: string | null;
            slug: string;
            onboardingStep: import("@prisma/identity-client").$Enums.OnboardingStep;
        } | undefined;
    }>;
    customerLogin(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            referralCode?: string | undefined;
            commissionRate?: import("@prisma/identity-client/runtime/library").Decimal | undefined;
            totalReferrals?: number | undefined;
            profile?: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
                deletedById: string | null;
                updatedById: string | null;
                updatedByName: string | null;
                companyName: string | null;
                notes: string | null;
                industry: string | null;
                billingAddress: string | null;
                city: string | null;
                state: string | null;
                pincode: string | null;
                country: string | null;
                gstNumber: string | null;
                userId: string;
            } | undefined;
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            userType: any;
            role: any;
            roleDisplayName: any;
        };
        tenant: {
            id: string;
            name: string;
            status: import("@prisma/identity-client").$Enums.TenantStatus;
            industryCode: string | null;
            slug: string;
            onboardingStep: import("@prisma/identity-client").$Enums.OnboardingStep;
        } | undefined;
    }>;
    partnerLogin(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            referralCode?: string | undefined;
            commissionRate?: import("@prisma/identity-client/runtime/library").Decimal | undefined;
            totalReferrals?: number | undefined;
            profile?: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
                deletedById: string | null;
                updatedById: string | null;
                updatedByName: string | null;
                companyName: string | null;
                notes: string | null;
                industry: string | null;
                billingAddress: string | null;
                city: string | null;
                state: string | null;
                pincode: string | null;
                country: string | null;
                gstNumber: string | null;
                userId: string;
            } | undefined;
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            userType: any;
            role: any;
            roleDisplayName: any;
        };
        tenant: {
            id: string;
            name: string;
            status: import("@prisma/identity-client").$Enums.TenantStatus;
            industryCode: string | null;
            slug: string;
            onboardingStep: import("@prisma/identity-client").$Enums.OnboardingStep;
        } | undefined;
    }>;
    superAdminLogin(email: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    vendorLogin(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            userType: string;
            role: string;
        };
        vendor: {
            id: string;
            companyName: string;
            contactEmail: string;
            gstNumber: string | null;
            status: "APPROVED";
            revenueSharePct: number;
        };
        tenantId: string;
    }>;
    registerStaff(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        roleId: string;
        userType?: string;
        departmentId?: string;
        designationId?: string;
        createdBy: string;
    }): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        userType: any;
        role: any;
        roleDisplayName: any;
    }>;
    registerCustomer(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        companyName?: string;
        gstNumber?: string;
        city?: string;
        state?: string;
        country?: string;
        industry?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            userType: any;
            role: any;
            roleDisplayName: any;
        };
    }>;
    registerPartner(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        panNumber?: string;
        bankName?: string;
        bankAccount?: string;
        ifscCode?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            referralCode: string;
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            userType: any;
            role: any;
            roleDisplayName: any;
        };
    }>;
    isSlugAvailable(slug: string): Promise<boolean>;
    registerTenant(data: {
        companyName: string;
        slug: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        planId?: string;
        businessTypeCode?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: string;
            lastName: string;
            userType: string;
            role: string;
        };
        tenant: {
            id: any;
            name: any;
            slug: any;
            status: any;
            onboardingStep: any;
            industryCode: string | null;
        };
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    changePassword(userId: string, current: string, newPass: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        role: {
            id: string;
            name: string;
            displayName: string;
        };
        customerProfile: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            companyName: string | null;
            notes: string | null;
            industry: string | null;
            billingAddress: string | null;
            city: string | null;
            state: string | null;
            pincode: string | null;
            country: string | null;
            gstNumber: string | null;
            userId: string;
        } | null;
        referralPartner: {
            id: string;
            tenantId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            notes: string | null;
            panNumber: string | null;
            userId: string;
            referralCode: string;
            commissionRate: import("@prisma/identity-client/runtime/library").Decimal;
            totalReferrals: number;
            totalEarnings: import("@prisma/identity-client/runtime/library").Decimal;
            bankName: string | null;
            bankAccount: string | null;
            ifscCode: string | null;
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        createdBy: string | null;
        status: import("@prisma/identity-client").$Enums.UserStatus;
        firstName: string;
        lastName: string;
        companyName: string | null;
        email: string;
        businessType: string | null;
        roleId: string;
        password: string;
        phone: string | null;
        avatar: string | null;
        userType: import("@prisma/identity-client").$Enums.UserType;
        lastLoginAt: Date | null;
        departmentId: string | null;
        designationId: string | null;
        reportingToId: string | null;
        employeeCode: string | null;
        joiningDate: Date | null;
        verificationStatus: import("@prisma/identity-client").$Enums.VerificationStatus;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        mobileVerified: boolean;
        mobileVerifiedAt: Date | null;
        registrationType: import("@prisma/identity-client").$Enums.RegistrationType;
        gstNumber: string | null;
        gstVerified: boolean;
        gstVerifiedAt: Date | null;
        gstVerificationMethod: string | null;
        panNumber: string | null;
        annualTurnover: string | null;
    }>;
    getVendorProfile(vendorId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        userType: string;
        role: {
            id: null;
            name: string;
            displayName: string;
        };
        vendor: {
            id: string;
            companyName: string;
            contactEmail: string;
            gstNumber: string | null;
            status: import("@prisma/platform-client").$Enums.VendorStatus;
        };
    }>;
    getSuperAdminProfile(adminId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        userType: string;
        role: {
            id: null;
            name: string;
            displayName: string;
        };
    }>;
    private loginWithType;
    private generateTokens;
    private mapUserResponse;
    private getSaltRounds;
    private getOrCreateRole;
    private generateReferralCode;
}
