export class SetupWabaCommand {
  constructor(
    public readonly wabaId: string,
    public readonly phoneNumberId: string,
    public readonly phoneNumber: string,
    public readonly displayName: string,
    public readonly accessToken: string,
    public readonly webhookVerifyToken: string,
  ) {}
}
