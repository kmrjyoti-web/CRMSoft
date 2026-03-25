export class ExtendTestEnvTtlCommand {
  constructor(
    public readonly testEnvId: string,
    public readonly additionalHours: number,
  ) {}
}
