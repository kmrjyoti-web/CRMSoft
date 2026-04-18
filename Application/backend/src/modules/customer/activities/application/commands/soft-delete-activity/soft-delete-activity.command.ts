export class SoftDeleteActivityCommand {
  constructor(
    public readonly activityId: string,
    public readonly deletedById: string,
  ) {}
}
