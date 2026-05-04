export class UnlinkEmailFromEntityCommand {
  constructor(
    public readonly emailId: string,
    public readonly userId: string,
  ) {}
}
