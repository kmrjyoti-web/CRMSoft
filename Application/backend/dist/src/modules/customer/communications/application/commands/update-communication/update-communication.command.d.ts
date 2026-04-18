export declare class UpdateCommunicationCommand {
    readonly communicationId: string;
    readonly data: {
        value?: string;
        priorityType?: string;
        label?: string;
    };
    constructor(communicationId: string, data: {
        value?: string;
        priorityType?: string;
        label?: string;
    });
}
