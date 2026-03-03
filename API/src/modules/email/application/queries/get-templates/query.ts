export class GetTemplatesQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly category?: string,
    public readonly isShared?: boolean,
    public readonly search?: string,
  ) {}
}
