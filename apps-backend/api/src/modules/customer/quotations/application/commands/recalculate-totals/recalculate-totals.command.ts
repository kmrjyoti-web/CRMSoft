export class RecalculateTotalsCommand {
  constructor(
    public readonly quotationId: string,
    public readonly userId: string,
    public readonly userName: string,
  ) {}
}
