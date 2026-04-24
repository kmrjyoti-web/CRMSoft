export class GetRowDetailQuery {
  constructor(
    public readonly jobId: string,
    public readonly rowId: string,
  ) {}
}
