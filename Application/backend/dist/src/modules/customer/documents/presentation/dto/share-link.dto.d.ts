import { ShareLinkAccess } from '@prisma/working-client';
export declare class CreateShareLinkDto {
    access?: ShareLinkAccess;
    password?: string;
    expiresAt?: string;
    maxViews?: number;
}
export declare class AccessShareLinkDto {
    password?: string;
}
