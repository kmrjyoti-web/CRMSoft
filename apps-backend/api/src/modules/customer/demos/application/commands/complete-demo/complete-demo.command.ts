export class CompleteDemoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly result: string,
    public readonly outcome?: string,
    public readonly notes?: string,
  ) {}
}
