export class LogManualTestCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly dto: {
      testRunId?: string;
      testGroupId?: string;
      module: string;
      pageName: string;
      action: string;
      expectedResult: string;
      actualResult: string;
      status: string;
      severity?: string;
      screenshotUrls?: string[];
      videoUrl?: string;
      notes?: string;
      browser?: string;
      os?: string;
      screenResolution?: string;
    },
  ) {}
}
