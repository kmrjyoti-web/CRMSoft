export class UpdateFieldDefinitionCommand {
  constructor(
    public readonly id: string,
    public readonly data: {
      fieldLabel?: string;
      isRequired?: boolean;
      defaultValue?: string;
      options?: Record<string, unknown>;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {}
}
