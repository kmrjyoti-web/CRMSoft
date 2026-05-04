export class UpdateTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly priority?: string,
    public readonly dueDate?: Date,
    public readonly recurrence?: string,
  ) {}
}
