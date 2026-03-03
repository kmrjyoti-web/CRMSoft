export class UpdateFieldDefinitionCommand {
  constructor(
    public readonly id: string,
    public readonly data: {
      fieldLabel?: string;
      isRequired?: boolean;
      defaultValue?: string;
      options?: any;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {}
}
