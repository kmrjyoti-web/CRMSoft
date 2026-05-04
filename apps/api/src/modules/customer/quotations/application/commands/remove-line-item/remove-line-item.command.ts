export class RemoveLineItemCommand {
  constructor(
    public readonly quotationId: string,
    public readonly itemId: string,
    public readonly userId: string,
    public readonly userName: string,
  ) {}
}
