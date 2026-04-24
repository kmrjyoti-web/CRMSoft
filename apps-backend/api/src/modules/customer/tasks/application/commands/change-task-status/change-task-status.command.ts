export class ChangeTaskStatusCommand {
  constructor(
    public readonly taskId: string,
    public readonly newStatus: string,
    public readonly userId: string,
    public readonly reason?: string,
  ) {}
}
