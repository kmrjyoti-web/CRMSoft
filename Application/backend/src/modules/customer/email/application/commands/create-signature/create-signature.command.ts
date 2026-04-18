export class CreateSignatureCommand {
  constructor(
    public readonly name: string,
    public readonly bodyHtml: string,
    public readonly isDefault: boolean,
    public readonly userId: string,
  ) {}
}
