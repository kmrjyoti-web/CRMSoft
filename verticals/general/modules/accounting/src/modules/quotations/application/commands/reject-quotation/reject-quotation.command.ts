export class RejectQuotationCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly reason?: string,
  ) {}
}
