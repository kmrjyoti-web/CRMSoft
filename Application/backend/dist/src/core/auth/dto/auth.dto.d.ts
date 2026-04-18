export declare class LoginDto {
    email: string;
    password: string;
    tenantSlug?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roleId: string;
    userType?: string;
    departmentId?: string;
    designationId?: string;
}
export declare class CustomerRegisterDto {
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
}
export declare class PartnerRegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    panNumber?: string;
    bankName?: string;
    bankAccount?: string;
    ifscCode?: string;
}
export declare class TenantRegisterDto {
    companyName: string;
    slug: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    planId?: string;
    businessTypeCode?: string;
}
