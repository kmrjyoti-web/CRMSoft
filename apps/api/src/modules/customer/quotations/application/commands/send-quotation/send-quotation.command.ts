export class SendQuotationCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly channel: string,
    public readonly receiverContactId?: string,
    public readonly receiverEmail?: string,
    public readonly receiverPhone?: string,
    public readonly message?: string,
  ) {}
}
