export class GetTargetTrackingQuery {
  constructor(
    public readonly period?: string,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
  ) {}
}
