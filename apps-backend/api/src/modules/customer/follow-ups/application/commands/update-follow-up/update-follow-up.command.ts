export class UpdateFollowUpCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly data: {
      title?: string;
      description?: string;
      dueDate?: Date;
      priority?: string;
    },
  ) {}
}
