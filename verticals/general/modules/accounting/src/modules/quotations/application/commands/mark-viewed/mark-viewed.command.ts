export class MarkViewedCommand {
  constructor(
    public readonly id: string,
    public readonly sendLogId?: string,
  ) {}
}
