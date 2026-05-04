export class ExportReportCommand {
  constructor(
    public readonly reportType: string,
    public readonly format: string,
    public readonly filters: {
      dateFrom?: Date;
      dateTo?: Date;
      userId?: string;
      status?: string;
    },
    public readonly exportedById: string,
    public readonly exportedByName: string,
  ) {}
}
