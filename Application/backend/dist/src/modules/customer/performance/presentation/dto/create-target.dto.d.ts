export declare enum TargetMetric {
    LEADS_CREATED = "LEADS_CREATED",
    LEADS_WON = "LEADS_WON",
    REVENUE = "REVENUE",
    ACTIVITIES = "ACTIVITIES",
    DEMOS = "DEMOS",
    CALLS = "CALLS",
    MEETINGS = "MEETINGS",
    VISITS = "VISITS",
    QUOTATIONS_SENT = "QUOTATIONS_SENT",
    QUOTATIONS_ACCEPTED = "QUOTATIONS_ACCEPTED"
}
export declare enum TargetPeriod {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY",
    YEARLY = "YEARLY"
}
export declare class CreateTargetDto {
    name?: string;
    metric: TargetMetric;
    targetValue: number;
    period: TargetPeriod;
    periodStart: string;
    periodEnd: string;
    userId?: string;
    roleId?: string;
    notes?: string;
}
