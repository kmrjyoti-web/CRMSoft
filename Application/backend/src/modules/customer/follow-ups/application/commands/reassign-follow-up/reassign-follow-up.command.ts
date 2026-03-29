export class ReassignFollowUpCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly newAssigneeId: string,
  ) {}
}
