export declare class CreateTargetCommand {
    readonly createdById: string;
    readonly metric: string;
    readonly targetValue: number;
    readonly period: string;
    readonly periodStart: string;
    readonly periodEnd: string;
    readonly name?: string | undefined;
    readonly userId?: string | undefined;
    readonly roleId?: string | undefined;
    readonly notes?: string | undefined;
    constructor(createdById: string, metric: string, targetValue: number, period: string, periodStart: string, periodEnd: string, name?: string | undefined, userId?: string | undefined, roleId?: string | undefined, notes?: string | undefined);
}
