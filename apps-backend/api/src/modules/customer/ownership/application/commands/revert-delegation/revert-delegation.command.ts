export class RevertDelegationCommand {
  constructor(
    public readonly delegationId: string,
    public readonly revertedById: string,
  ) {}
}
