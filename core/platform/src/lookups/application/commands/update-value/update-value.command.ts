export class UpdateValueCommand {
  constructor(
    public readonly valueId: string,
    public readonly data: {
      label?: string;
      icon?: string;
      color?: string;
      isDefault?: boolean;
      configJson?: Record<string, unknown>;
    },
  ) {}
}
