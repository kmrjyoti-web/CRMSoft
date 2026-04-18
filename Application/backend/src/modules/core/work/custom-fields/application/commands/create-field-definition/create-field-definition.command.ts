export class CreateFieldDefinitionCommand {
  constructor(
    public readonly entityType: string,
    public readonly fieldName: string,
    public readonly fieldLabel: string,
    public readonly fieldType: string,
    public readonly isRequired?: boolean,
    public readonly defaultValue?: string,
    public readonly options?: Record<string, unknown>,
    public readonly sortOrder?: number,
  ) {}
}
