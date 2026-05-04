export class CancelTourPlanCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly reason?: string,
  ) {}
}
