export declare class GetCommunicationsByEntityQuery {
    readonly entityType: 'rawContact' | 'contact' | 'organization' | 'lead';
    readonly entityId: string;
    readonly type?: string | undefined;
    constructor(entityType: 'rawContact' | 'contact' | 'organization' | 'lead', entityId: string, type?: string | undefined);
}
