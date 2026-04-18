export declare class ConnectAccountCommand {
    readonly provider: string;
    readonly userId: string;
    readonly emailAddress: string;
    readonly displayName?: string | undefined;
    readonly label?: string | undefined;
    readonly accessToken?: string | undefined;
    readonly refreshToken?: string | undefined;
    readonly tokenExpiresAt?: Date | undefined;
    readonly imapHost?: string | undefined;
    readonly imapPort?: number | undefined;
    readonly imapSecure?: boolean | undefined;
    readonly smtpHost?: string | undefined;
    readonly smtpPort?: number | undefined;
    readonly smtpSecure?: boolean | undefined;
    readonly smtpUsername?: string | undefined;
    readonly smtpPassword?: string | undefined;
    constructor(provider: string, userId: string, emailAddress: string, displayName?: string | undefined, label?: string | undefined, accessToken?: string | undefined, refreshToken?: string | undefined, tokenExpiresAt?: Date | undefined, imapHost?: string | undefined, imapPort?: number | undefined, imapSecure?: boolean | undefined, smtpHost?: string | undefined, smtpPort?: number | undefined, smtpSecure?: boolean | undefined, smtpUsername?: string | undefined, smtpPassword?: string | undefined);
}
