export class AssignProductFiltersCommand {
  constructor(
    public readonly productId: string,
    public readonly lookupValueIds: string[],
  ) {}
}
