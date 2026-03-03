export class UpdateTargetCommand {
  constructor(
    public readonly id: string,
    public readonly targetValue?: number,
    public readonly name?: string,
    public readonly notes?: string,
    public readonly isActive?: boolean,
  ) {}
}
