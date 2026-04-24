export class CloneProfileCommand {
  constructor(
    public readonly profileId: string,
    public readonly newName: string,
    public readonly createdById: string,
    public readonly createdByName: string,
  ) {}
}
