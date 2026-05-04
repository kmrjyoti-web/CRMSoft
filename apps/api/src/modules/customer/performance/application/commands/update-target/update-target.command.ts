export class UpdateTargetCommand {
  constructor(
    public readonly id: string,
    public readonly updatedById: string,
    public readonly data: {
      name?: string;
      metric?: string;
      targetValue?: number;
      period?: string;
      periodStart?: string;
      periodEnd?: string;
      userId?: string;
      roleId?: string;
      notes?: string;
      isActive?: boolean;
    },
  ) {}
}
