export declare class UpdateActivityCommand {
    readonly id: string;
    readonly userId: string;
    readonly data: {
        subject?: string;
        description?: string;
        type?: string;
        scheduledAt?: Date;
        endTime?: Date;
        duration?: number;
        locationName?: string;
        latitude?: number;
        longitude?: number;
    };
    constructor(id: string, userId: string, data: {
        subject?: string;
        description?: string;
        type?: string;
        scheduledAt?: Date;
        endTime?: Date;
        duration?: number;
        locationName?: string;
        latitude?: number;
        longitude?: number;
    });
}
