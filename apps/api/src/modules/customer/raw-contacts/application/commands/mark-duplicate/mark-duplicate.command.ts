export class MarkDuplicateCommand {
  constructor(
    public readonly rawContactId: string,
    public readonly duplicateOfId?: string,
  ) {}
}
