import { StorageProvider } from '@prisma/working-client';
export declare class DisconnectCloudCommand {
    readonly userId: string;
    readonly provider: StorageProvider;
    constructor(userId: string, provider: StorageProvider);
}
