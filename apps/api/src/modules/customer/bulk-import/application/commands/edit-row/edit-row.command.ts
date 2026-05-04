export class EditRowCommand {
  constructor(
    public readonly jobId: string,
    public readonly rowId: string,
    public readonly editedData: Record<string, any>,
  ) {}
}
