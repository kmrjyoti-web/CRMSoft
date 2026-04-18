export declare class SetUserAvailabilityCommand {
    readonly userId: string;
    readonly isAvailable: boolean;
    readonly unavailableFrom?: Date | undefined;
    readonly unavailableTo?: Date | undefined;
    readonly delegateToId?: string | undefined;
    readonly reason?: string | undefined;
    readonly performedById?: string | undefined;
    constructor(userId: string, isAvailable: boolean, unavailableFrom?: Date | undefined, unavailableTo?: Date | undefined, delegateToId?: string | undefined, reason?: string | undefined, performedById?: string | undefined);
}
