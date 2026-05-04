export class ChangePlanCommand {
  constructor(
    public readonly tenantId: string,
    public readonly newPlanId: string,
  ) {}
}
