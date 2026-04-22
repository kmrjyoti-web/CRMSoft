export class ReorderValuesCommand {
  constructor(
    public readonly lookupId: string,
    public readonly orderedIds: string[],
  ) {}
}
