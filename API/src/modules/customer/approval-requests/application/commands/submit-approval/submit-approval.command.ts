export class SubmitApprovalCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string | undefined,
    public readonly action: string,
    public readonly makerId: string,
    public readonly roleName: string,
    public readonly roleLevel: number,
    public readonly payload?: Record<string, any>,
    public readonly makerNote?: string,
  ) {}
}
