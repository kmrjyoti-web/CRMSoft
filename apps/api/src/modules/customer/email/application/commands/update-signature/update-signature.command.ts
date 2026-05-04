export class UpdateSignatureCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly bodyHtml?: string,
    public readonly isDefault?: boolean,
  ) {}
}
