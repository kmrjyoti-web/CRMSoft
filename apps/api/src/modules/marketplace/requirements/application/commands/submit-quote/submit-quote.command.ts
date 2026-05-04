export class SubmitQuoteCommand {
  constructor(
    public readonly requirementId: string,
    public readonly sellerId: string,
    public readonly tenantId: string,
    public readonly pricePerUnit: number,
    public readonly quantity: number,
    public readonly deliveryDays: number,
    public readonly creditDays?: number,
    public readonly notes?: string,
    public readonly certifications?: string[],
  ) {}
}
