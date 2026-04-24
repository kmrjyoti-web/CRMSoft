import { ShareLinkAccess } from '@prisma/working-client';

export class CreateShareLinkCommand {
  constructor(
    public readonly documentId: string,
    public readonly userId: string,
    public readonly access?: ShareLinkAccess,
    public readonly password?: string,
    public readonly expiresAt?: Date,
    public readonly maxViews?: number,
  ) {}
}
