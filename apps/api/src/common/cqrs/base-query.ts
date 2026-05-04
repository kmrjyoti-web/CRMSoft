/**
 * BaseQuery — all read queries extend this.
 * Queries are dispatched via QueryBus from the presentation layer.
 */
export abstract class BaseQuery {
  constructor(
    public readonly tenantId: string,
  ) {}
}
