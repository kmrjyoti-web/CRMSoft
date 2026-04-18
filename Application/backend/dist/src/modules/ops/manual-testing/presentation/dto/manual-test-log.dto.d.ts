export declare class CreateManualTestLogDto {
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
}
export declare class UpdateManualTestLogDto {
    actualResult?: string;
    status?: string;
    severity?: string;
    screenshotUrls?: string[];
    notes?: string;
    bugReported?: boolean;
    bugId?: string;
}
export declare class GetUploadUrlDto {
    filename: string;
    contentType: string;
}
