export class AssignTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly newAssigneeId: string,
    public readonly userId: string,
    public readonly userRoleLevel: number,
  ) {}
}
