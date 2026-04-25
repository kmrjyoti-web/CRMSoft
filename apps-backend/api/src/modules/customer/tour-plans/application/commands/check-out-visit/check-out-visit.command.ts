export class CheckOutVisitCommand {
  constructor(
    public readonly visitId: string,
    public readonly userId: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly photoUrl?: string,
    public readonly outcome?: string,
    public readonly notes?: string,
  ) {}
}
