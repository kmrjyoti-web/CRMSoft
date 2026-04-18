export declare class UpdateMappingCommand {
    readonly mappingId: string;
    readonly data: {
        designation?: string;
        department?: string;
    };
    constructor(mappingId: string, data: {
        designation?: string;
        department?: string;
    });
}
