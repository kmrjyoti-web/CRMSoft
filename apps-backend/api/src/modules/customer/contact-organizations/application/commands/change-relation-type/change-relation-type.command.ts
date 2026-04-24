export class ChangeRelationTypeCommand {
  constructor(
    public readonly mappingId: string,
    public readonly relationType: string,
  ) {}
}
