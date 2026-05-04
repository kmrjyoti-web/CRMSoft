export class CreateFolderCommand {
  constructor(
    public readonly name: string,
    public readonly userId: string,
    public readonly description?: string,
    public readonly parentId?: string,
    public readonly color?: string,
    public readonly icon?: string,
  ) {}
}
