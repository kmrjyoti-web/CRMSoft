export class UpdateTourPlanCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly data: {
      title?: string;
      description?: string;
      planDate?: Date;
      startLocation?: string;
      endLocation?: string;
    },
  ) {}
}
