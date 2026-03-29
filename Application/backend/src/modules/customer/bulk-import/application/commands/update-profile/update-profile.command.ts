export class UpdateProfileCommand {
  constructor(
    public readonly profileId: string,
    public readonly data: {
      name?: string;
      description?: string;
      sourceSystem?: string;
      icon?: string;
      color?: string;
      fieldMapping?: any[];
      expectedHeaders?: string[];
      defaultValues?: any;
      validationRules?: any[];
      duplicateCheckFields?: string[];
      duplicateStrategy?: string;
      fuzzyMatchEnabled?: boolean;
      fuzzyMatchFields?: string[];
      fuzzyThreshold?: number;
    },
  ) {}
}
