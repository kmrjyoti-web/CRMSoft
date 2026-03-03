export class UpdateWorkflowCommand {
  constructor(
    public readonly id: string,
    public readonly data: {
      name?: string;
      description?: string;
      isDefault?: boolean;
      isActive?: boolean;
      configJson?: any;
    },
  ) {}
}
