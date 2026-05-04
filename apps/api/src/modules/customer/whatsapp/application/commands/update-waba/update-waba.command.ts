export class UpdateWabaCommand {
  constructor(
    public readonly id: string,
    public readonly displayName?: string,
    public readonly accessToken?: string,
    public readonly settings?: Record<string, unknown>,
  ) {}
}
