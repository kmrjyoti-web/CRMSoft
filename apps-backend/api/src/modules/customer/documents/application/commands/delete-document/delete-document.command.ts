export class DeleteDocumentCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
