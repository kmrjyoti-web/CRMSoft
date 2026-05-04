export class CreateTestGroupCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly dto: {
      name: string;
      nameHi?: string;
      description?: string;
      icon?: string;
      color?: string;
      modules: string[];
      steps: Record<string, unknown>[];
      estimatedDuration?: number;
    },
  ) {}
}
