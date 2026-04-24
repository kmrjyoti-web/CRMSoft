export class GetShareLinkQuery {
  constructor(
    public readonly token: string,
    public readonly password?: string,
  ) {}
}
