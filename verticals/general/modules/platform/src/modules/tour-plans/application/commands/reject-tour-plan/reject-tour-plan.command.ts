export class RejectTourPlanCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly reason: string,
  ) {}
}
