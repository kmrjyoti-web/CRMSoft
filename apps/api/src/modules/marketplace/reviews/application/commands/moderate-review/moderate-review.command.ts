export type ModerationAction = 'APPROVE' | 'REJECT' | 'FLAG';

export class ModerateReviewCommand {
  constructor(
    public readonly reviewId: string,
    public readonly tenantId: string,
    public readonly moderatorId: string,
    public readonly action: ModerationAction,
    public readonly note?: string,
  ) {}
}
