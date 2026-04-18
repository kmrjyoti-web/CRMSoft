export declare class CronParserService {
    isValid(expression: string): boolean;
    getNextRun(expression: string, timezone?: string): Date;
    getNextRuns(expression: string, count: number, timezone?: string): Date[];
    describe(expression: string): string;
    private dowName;
}
