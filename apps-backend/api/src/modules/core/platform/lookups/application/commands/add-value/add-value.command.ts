export class AddValueCommand {
  constructor(
    public readonly lookupId: string,
    public readonly value: string,
    public readonly label: string,
    public readonly icon?: string,
    public readonly color?: string,
    public readonly isDefault?: boolean,
    public readonly parentId?: string,
    public readonly configJson?: Record<string, unknown>,
  ) {}
}
