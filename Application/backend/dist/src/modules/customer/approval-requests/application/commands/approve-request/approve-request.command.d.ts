export declare class ApproveRequestCommand {
    readonly requestId: string;
    readonly checkerId: string;
    readonly checkerRole: string;
    readonly note?: string | undefined;
    constructor(requestId: string, checkerId: string, checkerRole: string, note?: string | undefined);
}
