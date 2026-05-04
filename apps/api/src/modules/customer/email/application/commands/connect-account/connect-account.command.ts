export class ConnectAccountCommand {
  constructor(
    public readonly provider: string,
    public readonly userId: string,
    public readonly emailAddress: string,
    public readonly displayName?: string,
    public readonly label?: string,
    public readonly accessToken?: string,
    public readonly refreshToken?: string,
    public readonly tokenExpiresAt?: Date,
    public readonly imapHost?: string,
    public readonly imapPort?: number,
    public readonly imapSecure?: boolean,
    public readonly smtpHost?: string,
    public readonly smtpPort?: number,
    public readonly smtpSecure?: boolean,
    public readonly smtpUsername?: string,
    public readonly smtpPassword?: string,
  ) {}
}
