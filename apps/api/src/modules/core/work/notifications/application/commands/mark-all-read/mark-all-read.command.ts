export class MarkAllReadCommand {
  constructor(
    public readonly userId: string,
    public readonly category?: string,
  ) {}
}
