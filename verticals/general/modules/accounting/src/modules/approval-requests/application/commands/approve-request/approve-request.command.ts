export class ApproveRequestCommand {
  constructor(
    public readonly requestId: string,
    public readonly checkerId: string,
    public readonly checkerRole: string,
    public readonly note?: string,
  ) {}
}
