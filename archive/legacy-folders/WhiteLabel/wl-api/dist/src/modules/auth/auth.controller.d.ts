import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    adminLogin(dto: LoginDto): Promise<{
        accessToken: string;
        role: string;
        email: string;
    }>;
    partnerLogin(dto: LoginDto): Promise<{
        accessToken: string;
        role: string;
        partnerId: string;
        partnerCode: string;
    }>;
    getMe(req: any): Promise<{
        branding: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brandName: string;
            tagline: string | null;
            logo: string | null;
            favicon: string | null;
            loginBackground: string | null;
            primaryColor: string;
            secondaryColor: string;
            accentColor: string;
            fontFamily: string;
            emailFromName: string | null;
            emailFromAddress: string | null;
            supportEmail: string | null;
            supportPhone: string | null;
            supportUrl: string | null;
            termsUrl: string | null;
            privacyUrl: string | null;
            footerText: string | null;
            copyrightText: string | null;
            customCss: string | null;
            partnerId: string;
        } | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerCode: string;
        email: string;
        companyName: string;
        contactName: string;
        phone: string | null;
        gstNumber: string | null;
        panNumber: string | null;
        billingAddress: import("@prisma/client/runtime/client").JsonValue | null;
        status: import("@prisma/client").$Enums.PartnerStatus;
        plan: import("@prisma/client").$Enums.PartnerPlan;
        maxTenants: number;
        maxUsersPerTenant: number;
        dbConnectionConfig: import("@prisma/client/runtime/client").JsonValue | null;
        onboardedAt: Date | null;
        trialExpiresAt: Date | null;
        suspendedAt: Date | null;
        suspendedReason: string | null;
    } | {
        role: string;
        email: any;
    }>;
}
export {};
