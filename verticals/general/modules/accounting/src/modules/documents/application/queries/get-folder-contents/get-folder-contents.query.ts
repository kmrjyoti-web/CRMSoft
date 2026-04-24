export class GetFolderContentsQuery {
  constructor(
    public readonly folderId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
