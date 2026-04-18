export declare class CheckOutVisitCommand {
    readonly visitId: string;
    readonly userId: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly photoUrl?: string | undefined;
    readonly outcome?: string | undefined;
    readonly notes?: string | undefined;
    constructor(visitId: string, userId: string, latitude: number, longitude: number, photoUrl?: string | undefined, outcome?: string | undefined, notes?: string | undefined);
}
