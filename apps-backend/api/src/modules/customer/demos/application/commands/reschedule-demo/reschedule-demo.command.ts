export class RescheduleDemoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly scheduledAt: Date,
    public readonly reason?: string,
  ) {}
}
