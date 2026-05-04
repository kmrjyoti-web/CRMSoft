export class CreateTargetCommand {
  constructor(
    public readonly metric: string,
    public readonly targetValue: number,
    public readonly period: string,
    public readonly periodStart: Date,
    public readonly periodEnd: Date,
    public readonly createdById: string,
    public readonly userId?: string,
    public readonly roleId?: string,
    public readonly name?: string,
    public readonly notes?: string,
  ) {}
}
