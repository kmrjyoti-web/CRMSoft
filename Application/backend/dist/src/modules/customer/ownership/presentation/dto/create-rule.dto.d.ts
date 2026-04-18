export declare class CreateRuleDto {
    name: string;
    description?: string;
    entityType: string;
    triggerEvent: string;
    conditions: Record<string, unknown>[];
    assignmentMethod: string;
    assignToUserId?: string;
    assignToTeamIds?: string[];
    assignToRoleId?: string;
    ownerType?: string;
    priority?: number;
    maxPerUser?: number;
    respectWorkload?: boolean;
    escalateAfterHours?: number;
    escalateToUserId?: string;
    escalateToRoleId?: string;
}
