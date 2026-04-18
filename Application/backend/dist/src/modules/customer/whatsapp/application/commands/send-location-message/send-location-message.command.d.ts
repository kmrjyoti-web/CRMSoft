export declare class SendLocationMessageCommand {
    readonly wabaId: string;
    readonly conversationId: string;
    readonly lat: number;
    readonly lng: number;
    readonly name: string | undefined;
    readonly address: string | undefined;
    readonly userId: string;
    constructor(wabaId: string, conversationId: string, lat: number, lng: number, name: string | undefined, address: string | undefined, userId: string);
}
