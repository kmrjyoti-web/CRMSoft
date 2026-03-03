export class RowBulkActionCommand {
  constructor(
    public readonly jobId: string,
    public readonly action: 'ACCEPT_ALL_VALID' | 'SKIP_ALL_DUPLICATES' | 'SKIP_ALL_INVALID' | 'ACCEPT_ALL',
  ) {}
}
