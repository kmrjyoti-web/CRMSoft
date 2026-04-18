import { TargetMetric, TargetPeriod } from './create-target.dto';
export declare class TargetQueryDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    userId?: string;
    period?: TargetPeriod;
    metric?: TargetMetric;
    isActive?: boolean;
}
