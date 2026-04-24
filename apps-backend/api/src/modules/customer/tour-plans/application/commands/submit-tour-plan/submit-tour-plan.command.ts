export class SubmitTourPlanCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
