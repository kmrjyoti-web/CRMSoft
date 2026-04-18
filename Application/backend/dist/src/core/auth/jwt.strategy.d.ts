import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private config;
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
        email: string;
        role: string;
        userType: string;
        tenantId?: string;
        isSuperAdmin?: boolean;
    }): Promise<{
        id: string;
        email: string;
        role: string;
        userType: string;
        tenantId: string | undefined;
        isSuperAdmin: boolean;
        vendorId?: undefined;
        firstName?: undefined;
        lastName?: undefined;
        roleId?: undefined;
        roleLevel?: undefined;
        departmentId?: undefined;
        departmentPath?: undefined;
        businessTypeCode?: undefined;
    } | {
        id: string;
        email: string;
        role: string;
        userType: string;
        vendorId: any;
        tenantId?: undefined;
        isSuperAdmin?: undefined;
        firstName?: undefined;
        lastName?: undefined;
        roleId?: undefined;
        roleLevel?: undefined;
        departmentId?: undefined;
        departmentPath?: undefined;
        businessTypeCode?: undefined;
    } | {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        roleId: string;
        roleLevel: number;
        userType: import("@prisma/identity-client").$Enums.UserType;
        departmentId: string | null;
        departmentPath: string | null | undefined;
        tenantId: string;
        businessTypeCode: string | undefined;
        isSuperAdmin?: undefined;
        vendorId?: undefined;
    }>;
}
export {};
