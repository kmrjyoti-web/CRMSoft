import { PrismaClient } from '@prisma/client';
declare const DEMO_TENANTS: ({
    name: string;
    slug: string;
    status: "ACTIVE";
    onboardingStep: "COMPLETED";
    planCode: string;
    profile: {
        companyLegalName: string;
        industry: string;
        website: string;
        supportEmail: string;
        primaryContactName: string;
        primaryContactEmail: string;
        primaryContactPhone: string;
        gstin: string;
        pan: string;
        billingAddress: {
            line1: string;
            city: string;
            state: string;
            pincode: string;
            country: string;
        };
    };
} | {
    name: string;
    slug: string;
    status: "ACTIVE";
    onboardingStep: "COMPLETED";
    planCode: string;
    profile: {
        companyLegalName: string;
        industry: string;
        supportEmail: string;
        primaryContactName: string;
        primaryContactEmail: string;
        primaryContactPhone: string;
        gstin: string;
        pan: string;
        billingAddress: {
            line1: string;
            city: string;
            state: string;
            pincode: string;
            country: string;
        };
        website?: undefined;
    };
})[];
declare const ROLE_TEMPLATES: Array<{
    name: string;
    displayName: string;
    description: string;
    level: number;
    isSystem: boolean;
    canManageLevels: number[];
    parentRoleName?: string;
}>;
interface UserSeed {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roleName: string;
    userType: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER' | 'REFERRAL_PARTNER';
    verificationStatus: 'UNVERIFIED' | 'PARTIALLY_VERIFIED' | 'FULLY_VERIFIED';
    registrationType: 'INDIVIDUAL' | 'BUSINESS';
    emailVerified: boolean;
    mobileVerified: boolean;
    companyName?: string;
    gstNumber?: string;
    gstVerified?: boolean;
    businessType?: string;
    reportsToEmail?: string;
    employeeCode?: string;
}
declare const SHARMA_USERS: UserSeed[];
declare const MUMBAI_USERS: UserSeed[];
declare const TECHSERVE_USERS: UserSeed[];
declare const MARKETPLACE_CUSTOMERS: UserSeed[];
export declare function seedDemoData(prisma: PrismaClient): Promise<void>;
export { DEMO_TENANTS, ROLE_TEMPLATES, SHARMA_USERS, MUMBAI_USERS, TECHSERVE_USERS, MARKETPLACE_CUSTOMERS };
