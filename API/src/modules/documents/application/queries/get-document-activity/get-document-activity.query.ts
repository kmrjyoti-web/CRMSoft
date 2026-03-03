export class GetDocumentActivityQuery {
  constructor(
    public readonly documentId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
