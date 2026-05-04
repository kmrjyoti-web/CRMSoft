export class GetLeaderboardQuery {
  constructor(
    public readonly period?: string,
    public readonly limit?: number,
  ) {}
}
