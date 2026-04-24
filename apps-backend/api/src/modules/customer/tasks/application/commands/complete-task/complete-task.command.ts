export class CompleteTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
    public readonly completionNotes?: string,
    public readonly actualMinutes?: number,
  ) {}
}
