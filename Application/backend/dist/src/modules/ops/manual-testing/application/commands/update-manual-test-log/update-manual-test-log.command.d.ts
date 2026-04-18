export declare class UpdateManualTestLogCommand {
    readonly id: string;
    readonly dto: {
        actualResult?: string;
        status?: string;
        severity?: string;
        screenshotUrls?: string[];
        notes?: string;
        bugReported?: boolean;
        bugId?: string;
    };
    constructor(id: string, dto: {
        actualResult?: string;
        status?: string;
        severity?: string;
        screenshotUrls?: string[];
        notes?: string;
        bugReported?: boolean;
        bugId?: string;
    });
}
