import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto, CustomerRegisterDto, PartnerRegisterDto, TenantRegisterDto } from './dto/auth.dto';
import { ApiResponse } from '../../common/utils/api-response';
import { PermissionChainService } from '../permissions/services/permission-chain.service';
export declare class AuthController {
    private auth;
    private permissionChain;
    constructor(auth: AuthService, permissionChain: PermissionChainService);
    adminLogin(dto: LoginDto): Promise<ApiResponse<{
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
    }>>;
    employeeLogin(dto: LoginDto): Promise<ApiResponse<{
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
    }>>;
    customerLogin(dto: LoginDto): Promise<ApiResponse<{
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
    }>>;
    partnerLogin(dto: LoginDto): Promise<ApiResponse<{
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
    }>>;
    vendorLogin(dto: LoginDto): Promise<ApiResponse<{
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
    }>>;
    superAdminLogin(dto: LoginDto): Promise<ApiResponse<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
        accessToken: string;
        refreshToken: string;
    }>>;
    customerRegister(dto: CustomerRegisterDto): Promise<ApiResponse<{
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
    }>>;
    partnerRegister(dto: PartnerRegisterDto): Promise<ApiResponse<{
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
    }>>;
    checkSlug(slug: string): Promise<ApiResponse<{
        available: boolean;
    }>>;
    tenantRegister(dto: TenantRegisterDto): Promise<ApiResponse<{
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
    }>>;
    registerStaff(dto: RegisterDto, userId: string): Promise<ApiResponse<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        userType: any;
        role: any;
        roleDisplayName: any;
    }>>;
    refresh(dto: RefreshTokenDto): Promise<ApiResponse<{
        accessToken: string;
        refreshToken: string;
    }>>;
    changePassword(dto: ChangePasswordDto, userId: string): Promise<ApiResponse<{
        message: string;
    }>>;
    permissions(user: any): Promise<ApiResponse<string[]>>;
    me(user: any): Promise<ApiResponse<{
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
    }> | ApiResponse<{
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
    }>>;
}
