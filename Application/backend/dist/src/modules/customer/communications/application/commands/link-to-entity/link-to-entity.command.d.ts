export declare class LinkToEntityCommand {
    readonly communicationId: string;
    readonly entityType: 'contact' | 'organization' | 'lead';
    readonly entityId: string;
    constructor(communicationId: string, entityType: 'contact' | 'organization' | 'lead', entityId: string);
}
