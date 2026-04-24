export class AttachDocumentCommand {
  constructor(
    public readonly documentId: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly userId: string,
  ) {}
}
