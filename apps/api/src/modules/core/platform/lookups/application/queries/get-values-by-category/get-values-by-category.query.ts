export class GetValuesByCategoryQuery {
  constructor(
    public readonly category: string,
    public readonly activeOnly?: boolean,
  ) {}
}
