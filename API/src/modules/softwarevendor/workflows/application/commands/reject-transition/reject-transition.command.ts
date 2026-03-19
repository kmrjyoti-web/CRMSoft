export class RejectTransitionCommand {
  constructor(
    public readonly approvalId: string,
    public readonly userId: string,
    public readonly comment?: string,
  ) {}
}
