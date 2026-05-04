export class UpdateManualTestLogCommand {
  constructor(
    public readonly id: string,
    public readonly dto: {
      actualResult?: string;
      status?: string;
      severity?: string;
      screenshotUrls?: string[];
      notes?: string;
      bugReported?: boolean;
      bugId?: string;
    },
  ) {}
}
