export class SetFieldValueCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly values: {
      definitionId: string;
      valueText?: string;
      valueNumber?: number;
      valueDate?: string;
      valueBoolean?: boolean;
      valueJson?: Record<string, unknown>;
      valueDropdown?: string;
    }[],
  ) {}
}
