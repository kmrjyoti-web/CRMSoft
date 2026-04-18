import { StorageProvider } from '@prisma/working-client';
export declare class ConnectCloudCommand {
    readonly userId: string;
    readonly provider: StorageProvider;
    readonly accessToken: string;
    readonly refreshToken?: string | undefined;
    readonly tokenExpiry?: Date | undefined;
    readonly accountEmail?: string | undefined;
    readonly accountName?: string | undefined;
    constructor(userId: string, provider: StorageProvider, accessToken: string, refreshToken?: string | undefined, tokenExpiry?: Date | undefined, accountEmail?: string | undefined, accountName?: string | undefined);
}
