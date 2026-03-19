export class GetTemplatesQuery {
  constructor(
    public readonly industry?: string,
    public readonly search?: string,
  ) {}
}
