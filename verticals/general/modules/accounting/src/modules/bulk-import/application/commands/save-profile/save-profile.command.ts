export class SaveProfileCommand {
  constructor(
    public readonly jobId: string,
    public readonly name: string,
    public readonly description?: string,
    public readonly sourceSystem?: string,
  ) {}
}
