import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from './report.interface';
export interface FilterDefinition {
    key: string;
    label: string;
    type: 'date_range' | 'select' | 'multi_select' | 'text' | 'user' | 'boolean';
    options?: Array<{
        value: string;
        label: string;
    }>;
    required?: boolean;
    defaultValue?: any;
}
export interface IReport {
    readonly code: string;
    readonly name: string;
    readonly category: string;
    readonly description: string;
    readonly availableFilters: FilterDefinition[];
    readonly supportsDrillDown: boolean;
    readonly supportsPeriodComparison: boolean;
    generate(params: ReportParams): Promise<ReportData>;
    drillDown?(params: DrillDownParams): Promise<DrillDownResult>;
}
