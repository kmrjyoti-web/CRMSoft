export class UpdateFolderCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly color?: string,
    public readonly icon?: string,
  ) {}
}
