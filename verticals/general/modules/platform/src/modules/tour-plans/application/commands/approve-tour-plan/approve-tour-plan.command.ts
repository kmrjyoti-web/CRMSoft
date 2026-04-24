export class ApproveTourPlanCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly comment?: string,
  ) {}
}
