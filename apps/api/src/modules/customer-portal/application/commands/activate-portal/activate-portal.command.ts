export type InviteChannel = 'EMAIL' | 'WHATSAPP';

export class ActivatePortalCommand {
  constructor(
    public readonly tenantId: string,
    public readonly adminId: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly menuCategoryId?: string,
    public readonly channels?: InviteChannel[],
    public readonly customMessage?: string,
  ) {}
}
