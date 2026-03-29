export class GetTemplatesQuery {
  constructor(
    public readonly category?: string,
    public readonly isActive?: boolean,
  ) {}
}
