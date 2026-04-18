export declare class CheckInVisitCommand {
    readonly visitId: string;
    readonly userId: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly photoUrl?: string | undefined;
    constructor(visitId: string, userId: string, latitude: number, longitude: number, photoUrl?: string | undefined);
}
