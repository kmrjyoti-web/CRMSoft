export class RevokeShareLinkCommand {
  constructor(
    public readonly linkId: string,
    public readonly userId: string,
  ) {}
}
