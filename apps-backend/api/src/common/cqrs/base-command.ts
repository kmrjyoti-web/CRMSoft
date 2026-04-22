/**
 * BaseCommand — all write commands extend this.
 * Commands are dispatched via CommandBus from the presentation layer.
 */
export abstract class BaseCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
  ) {}
}
