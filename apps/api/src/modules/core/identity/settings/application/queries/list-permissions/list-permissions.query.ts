export class ListPermissionsQuery {
  constructor(
    public readonly module?: string,
    public readonly search?: string,
  ) {}
}
