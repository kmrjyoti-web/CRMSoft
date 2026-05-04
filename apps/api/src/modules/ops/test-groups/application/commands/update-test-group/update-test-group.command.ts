export class UpdateTestGroupCommand {
  constructor(
    public readonly id: string,
    public readonly dto: {
      name?: string;
      nameHi?: string;
      description?: string;
      icon?: string;
      color?: string;
      modules?: string[];
      steps?: Record<string, unknown>[];
      status?: string;
      estimatedDuration?: number;
    },
  ) {}
}
