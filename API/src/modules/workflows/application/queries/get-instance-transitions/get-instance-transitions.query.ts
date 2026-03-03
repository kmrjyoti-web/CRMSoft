export class GetInstanceTransitionsQuery {
  constructor(
    public readonly instanceId: string,
    public readonly userId?: string,
  ) {}
}
