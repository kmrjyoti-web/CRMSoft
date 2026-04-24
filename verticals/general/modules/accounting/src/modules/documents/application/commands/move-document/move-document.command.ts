export class MoveDocumentCommand {
  constructor(
    public readonly id: string,
    public readonly folderId: string | null,
    public readonly userId: string,
  ) {}
}
