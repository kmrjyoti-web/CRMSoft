import { EmailProvider } from '@prisma/working-client';
export declare class TestConnectionDto {
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUsername: string;
    smtpPassword: string;
    imapHost?: string;
    imapPort?: number;
    imapSecure?: boolean;
}
export declare class OAuthInitiateDto {
    provider: 'GMAIL' | 'OUTLOOK';
}
export declare class OAuthCallbackDto {
    code: string;
    provider: 'GMAIL' | 'OUTLOOK';
    emailAddress?: string;
    displayName?: string;
    label?: string;
}
export declare class ConnectAccountDto {
    provider: EmailProvider;
    emailAddress: string;
    displayName?: string;
    label?: string;
    accessToken?: string;
    refreshToken?: string;
    imapHost?: string;
    imapPort?: number;
    imapSecure?: boolean;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUsername?: string;
    smtpPassword?: string;
}
