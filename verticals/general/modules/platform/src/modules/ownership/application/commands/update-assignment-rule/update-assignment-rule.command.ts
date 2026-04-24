export class UpdateAssignmentRuleCommand {
  constructor(
    public readonly id: string,
    public readonly data: {
      name?: string; description?: string; conditions?: Record<string, unknown>[];
      assignmentMethod?: string; assignToUserId?: string;
      assignToTeamIds?: string[]; assignToRoleId?: string;
      ownerType?: string; priority?: number; status?: string;
      maxPerUser?: number; respectWorkload?: boolean;
      escalateAfterHours?: number; escalateToUserId?: string;
      escalateToRoleId?: string;
    },
  ) {}
}
