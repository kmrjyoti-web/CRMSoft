export class RowActionCommand {
  constructor(
    public readonly jobId: string,
    public readonly rowId: string,
    public readonly action: 'ACCEPT' | 'SKIP' | 'FORCE_CREATE',
  ) {}
}
