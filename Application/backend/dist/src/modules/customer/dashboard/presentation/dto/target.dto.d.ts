export declare class CreateTargetDto {
    metric: string;
    targetValue: number;
    period: string;
    periodStart: string;
    periodEnd: string;
    userId?: string;
    roleId?: string;
    name?: string;
    notes?: string;
}
export declare class UpdateTargetDto {
    targetValue?: number;
    name?: string;
    notes?: string;
}
