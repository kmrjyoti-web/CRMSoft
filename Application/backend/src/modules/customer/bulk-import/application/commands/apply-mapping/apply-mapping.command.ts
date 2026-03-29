export class ApplyMappingCommand {
  constructor(
    public readonly jobId: string,
    public readonly fieldMapping: any[],
    public readonly validationRules?: any[],
    public readonly duplicateCheckFields?: string[],
    public readonly duplicateStrategy?: string,
    public readonly fuzzyMatchEnabled?: boolean,
    public readonly fuzzyMatchFields?: string[],
    public readonly fuzzyThreshold?: number,
    public readonly defaultValues?: any,
  ) {}
}
