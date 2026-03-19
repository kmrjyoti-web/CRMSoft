export class UpdatePreferencesCommand {
  constructor(
    public readonly userId: string,
    public readonly channels?: any,
    public readonly categories?: any,
    public readonly quietHoursStart?: string,
    public readonly quietHoursEnd?: string,
    public readonly digestFrequency?: string,
    public readonly timezone?: string,
  ) {}
}
