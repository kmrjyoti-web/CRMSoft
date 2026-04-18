export declare class CreateAssignmentRuleCommand {
    readonly name: string;
    readonly entityType: string;
    readonly triggerEvent: string;
    readonly conditions: Record<string, unknown>[];
    readonly assignmentMethod: string;
    readonly createdById: string;
    readonly description?: string | undefined;
    readonly assignToUserId?: string | undefined;
    readonly assignToTeamIds?: string[] | undefined;
    readonly assignToRoleId?: string | undefined;
    readonly ownerType?: string | undefined;
    readonly priority?: number | undefined;
    readonly maxPerUser?: number | undefined;
    readonly respectWorkload?: boolean | undefined;
    readonly escalateAfterHours?: number | undefined;
    readonly escalateToUserId?: string | undefined;
    readonly escalateToRoleId?: string | undefined;
    constructor(name: string, entityType: string, triggerEvent: string, conditions: Record<string, unknown>[], assignmentMethod: string, createdById: string, description?: string | undefined, assignToUserId?: string | undefined, assignToTeamIds?: string[] | undefined, assignToRoleId?: string | undefined, ownerType?: string | undefined, priority?: number | undefined, maxPerUser?: number | undefined, respectWorkload?: boolean | undefined, escalateAfterHours?: number | undefined, escalateToUserId?: string | undefined, escalateToRoleId?: string | undefined);
}
