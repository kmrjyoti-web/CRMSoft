import { ShareLinkAccess } from '@prisma/working-client';
export declare class CreateShareLinkCommand {
    readonly documentId: string;
    readonly userId: string;
    readonly access?: ShareLinkAccess | undefined;
    readonly password?: string | undefined;
    readonly expiresAt?: Date | undefined;
    readonly maxViews?: number | undefined;
    constructor(documentId: string, userId: string, access?: ShareLinkAccess | undefined, password?: string | undefined, expiresAt?: Date | undefined, maxViews?: number | undefined);
}
