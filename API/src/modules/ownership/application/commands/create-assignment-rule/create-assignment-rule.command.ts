export class CreateAssignmentRuleCommand {
  constructor(
    public readonly name: string,
    public readonly entityType: string,
    public readonly triggerEvent: string,
    public readonly conditions: any[],
    public readonly assignmentMethod: string,
    public readonly createdById: string,
    public readonly description?: string,
    public readonly assignToUserId?: string,
    public readonly assignToTeamIds?: string[],
    public readonly assignToRoleId?: string,
    public readonly ownerType?: string,
    public readonly priority?: number,
    public readonly maxPerUser?: number,
    public readonly respectWorkload?: boolean,
    public readonly escalateAfterHours?: number,
    public readonly escalateToUserId?: string,
    public readonly escalateToRoleId?: string,
  ) {}
}
