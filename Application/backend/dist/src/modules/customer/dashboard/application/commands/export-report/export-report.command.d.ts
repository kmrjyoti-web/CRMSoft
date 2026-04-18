export declare class ExportReportCommand {
    readonly reportType: string;
    readonly format: string;
    readonly filters: {
        dateFrom?: Date;
        dateTo?: Date;
        userId?: string;
        status?: string;
    };
    readonly exportedById: string;
    readonly exportedByName: string;
    constructor(reportType: string, format: string, filters: {
        dateFrom?: Date;
        dateTo?: Date;
        userId?: string;
        status?: string;
    }, exportedById: string, exportedByName: string);
}
