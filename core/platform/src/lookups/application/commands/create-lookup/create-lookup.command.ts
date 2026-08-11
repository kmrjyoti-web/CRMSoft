export class CreateLookupCommand {
  constructor(
    public readonly category: string,
    public readonly displayName: string,
    public readonly description?: string,
    public readonly isSystem?: boolean,
  ) {}
}
