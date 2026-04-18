import { CredentialProvider } from '@prisma/identity-client';
export interface FieldDefinition {
    key: string;
    label: string;
    type: 'text' | 'password' | 'email' | 'url' | 'textarea' | 'number';
    required: boolean;
    helpText?: string;
    placeholder?: string;
}
export interface CredentialSchema {
    provider: CredentialProvider;
    displayName: string;
    icon: string;
    category: 'EMAIL' | 'PAYMENT' | 'STORAGE' | 'TELEPHONY' | 'MAPS' | 'MESSAGING' | 'AI' | 'OTHER';
    fields: FieldDefinition[];
    setupGuide?: string;
    verifiable: boolean;
    supportsOAuth: boolean;
}
export declare class CredentialSchemaService {
    private readonly schemas;
    constructor();
    getSchema(provider: CredentialProvider): CredentialSchema | null;
    getAllSchemas(): CredentialSchema[];
    validate(provider: CredentialProvider, data: Record<string, any>): {
        valid: boolean;
        errors: string[];
    };
    private registerAll;
}
