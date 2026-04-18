export declare class UpdateTourPlanCommand {
    readonly id: string;
    readonly userId: string;
    readonly data: {
        title?: string;
        description?: string;
        planDate?: Date;
        startLocation?: string;
        endLocation?: string;
    };
    constructor(id: string, userId: string, data: {
        title?: string;
        description?: string;
        planDate?: Date;
        startLocation?: string;
        endLocation?: string;
    });
}
