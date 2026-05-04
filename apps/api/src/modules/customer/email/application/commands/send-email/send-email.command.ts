export class SendEmailCommand {
  constructor(
    public readonly emailId: string,
    public readonly userId: string,
  ) {}
}
