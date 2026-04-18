export declare class CreateTargetCommand {
    readonly metric: string;
    readonly targetValue: number;
    readonly period: string;
    readonly periodStart: Date;
    readonly periodEnd: Date;
    readonly createdById: string;
    readonly userId?: string | undefined;
    readonly roleId?: string | undefined;
    readonly name?: string | undefined;
    readonly notes?: string | undefined;
    constructor(metric: string, targetValue: number, period: string, periodStart: Date, periodEnd: Date, createdById: string, userId?: string | undefined, roleId?: string | undefined, name?: string | undefined, notes?: string | undefined);
}
