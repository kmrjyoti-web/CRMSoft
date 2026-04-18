export declare class RejectRequestCommand {
    readonly requestId: string;
    readonly checkerId: string;
    readonly note?: string | undefined;
    constructor(requestId: string, checkerId: string, note?: string | undefined);
}
