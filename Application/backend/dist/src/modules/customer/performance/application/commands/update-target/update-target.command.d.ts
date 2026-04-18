export declare class UpdateTargetCommand {
    readonly id: string;
    readonly updatedById: string;
    readonly data: {
        name?: string;
        metric?: string;
        targetValue?: number;
        period?: string;
        periodStart?: string;
        periodEnd?: string;
        userId?: string;
        roleId?: string;
        notes?: string;
        isActive?: boolean;
    };
    constructor(id: string, updatedById: string, data: {
        name?: string;
        metric?: string;
        targetValue?: number;
        period?: string;
        periodStart?: string;
        periodEnd?: string;
        userId?: string;
        roleId?: string;
        notes?: string;
        isActive?: boolean;
    });
}
