import { CredentialProvider } from '@prisma/identity-client';
export declare class UpsertCredentialDto {
    provider: CredentialProvider;
    instanceName?: string;
    credentials: Record<string, any>;
    description?: string;
    isPrimary?: boolean;
    dailyUsageLimit?: number;
    linkedAccountEmail?: string;
    webhookUrl?: string;
}
