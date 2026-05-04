export class ReorderMenusCommand {
  constructor(
    public readonly parentId: string | null,
    public readonly orderedIds: string[],
  ) {}
}
