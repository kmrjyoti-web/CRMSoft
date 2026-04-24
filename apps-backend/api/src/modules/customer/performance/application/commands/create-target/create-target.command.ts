export class CreateTargetCommand {
  constructor(
    public readonly createdById: string,
    public readonly metric: string,
    public readonly targetValue: number,
    public readonly period: string,
    public readonly periodStart: string,
    public readonly periodEnd: string,
    public readonly name?: string,
    public readonly userId?: string,
    public readonly roleId?: string,
    public readonly notes?: string,
  ) {}
}
