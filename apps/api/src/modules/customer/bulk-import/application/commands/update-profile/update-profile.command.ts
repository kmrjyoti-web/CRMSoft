export class UpdateProfileCommand {
  constructor(
    public readonly profileId: string,
    public readonly data: {
      name?: string;
      description?: string;
      sourceSystem?: string;
      icon?: string;
      color?: string;
      fieldMapping?: Record<string, unknown>[];
      expectedHeaders?: string[];
      defaultValues?: Record<string, unknown>;
      validationRules?: Record<string, unknown>[];
      duplicateCheckFields?: string[];
      duplicateStrategy?: string;
      fuzzyMatchEnabled?: boolean;
      fuzzyMatchFields?: string[];
      fuzzyThreshold?: number;
    },
  ) {}
}
