export class RejectRawContactCommand {
  constructor(
    public readonly rawContactId: string,
    public readonly reason?: string,
  ) {}
}
