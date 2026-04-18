export declare class UpdateRawContactCommand {
    readonly rawContactId: string;
    readonly data: {
        firstName?: string;
        lastName?: string;
        companyName?: string;
        designation?: string;
        department?: string;
        notes?: string;
    };
    constructor(rawContactId: string, data: {
        firstName?: string;
        lastName?: string;
        companyName?: string;
        designation?: string;
        department?: string;
        notes?: string;
    });
}
