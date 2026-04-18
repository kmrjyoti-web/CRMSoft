import { CredentialProvider } from '@prisma/identity-client';
export declare class GlobalDefaultCredentialDto {
    provider: CredentialProvider;
    credentials: Record<string, any>;
    description?: string;
    isEnabled?: boolean;
}
