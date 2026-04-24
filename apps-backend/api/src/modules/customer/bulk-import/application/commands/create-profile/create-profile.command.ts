export class CreateProfileCommand {
  constructor(
    public readonly name: string,
    public readonly targetEntity: string,
    public readonly fieldMapping: Record<string, unknown>[],
    public readonly expectedHeaders: string[],
    public readonly createdById: string,
    public readonly createdByName: string,
    public readonly description?: string,
    public readonly sourceSystem?: string,
    public readonly icon?: string,
    public readonly color?: string,
    public readonly defaultValues?: Record<string, unknown>,
    public readonly validationRules?: Record<string, unknown>[],
    public readonly duplicateCheckFields?: string[],
    public readonly duplicateStrategy?: string,
    public readonly fuzzyMatchEnabled?: boolean,
    public readonly fuzzyMatchFields?: string[],
    public readonly fuzzyThreshold?: number,
  ) {}
}
