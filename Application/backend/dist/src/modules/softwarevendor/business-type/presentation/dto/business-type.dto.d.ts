export declare class AssignBusinessTypeDto {
    typeCode: string;
}
export declare class UpdateTradeProfileDto {
    profile: Record<string, any>;
}
export declare class TerminologyItemDto {
    termKey: string;
    defaultLabel: string;
    customLabel: string;
    scope?: string;
    regionalLabel?: string;
    userHelpText?: string;
}
export declare class UpdateBusinessTypeDto {
    typeName?: string;
    description?: string;
    icon?: string;
    colorTheme?: string;
    terminologyMap?: Record<string, any>;
    extraFields?: Record<string, any>;
    defaultModules?: string[];
    recommendedModules?: string[];
    excludedModules?: string[];
    defaultLeadStages?: Record<string, unknown>;
    defaultActivityTypes?: Record<string, unknown>;
    registrationFields?: Record<string, unknown>;
    dashboardWidgets?: string[];
    isActive?: boolean;
    sortOrder?: number;
}
export declare class BulkTerminologyDto {
    items: TerminologyItemDto[];
}
