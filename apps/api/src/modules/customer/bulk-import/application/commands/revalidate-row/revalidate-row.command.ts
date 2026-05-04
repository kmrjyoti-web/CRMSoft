export class RevalidateRowCommand {
  constructor(
    public readonly jobId: string,
    public readonly rowId: string,
  ) {}
}
