export class UpdatePreferencesCommand {
  constructor(
    public readonly userId: string,
    public readonly channels?: Record<string, unknown>,
    public readonly categories?: Record<string, unknown>,
    public readonly quietHoursStart?: string,
    public readonly quietHoursEnd?: string,
    public readonly digestFrequency?: string,
    public readonly timezone?: string,
  ) {}
}
