export class SetUserAvailabilityCommand {
  constructor(
    public readonly userId: string,
    public readonly isAvailable: boolean,
    public readonly unavailableFrom?: Date,
    public readonly unavailableTo?: Date,
    public readonly delegateToId?: string,
    public readonly reason?: string,
    public readonly performedById?: string,
  ) {}
}
