export class RejectRequestCommand {
  constructor(
    public readonly requestId: string,
    public readonly checkerId: string,
    public readonly note?: string,
  ) {}
}
