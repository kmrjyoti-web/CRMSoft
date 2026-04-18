export declare class LogManualTestCommand {
    readonly tenantId: string;
    readonly userId: string;
    readonly dto: {
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
    };
    constructor(tenantId: string, userId: string, dto: {
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
    });
}
