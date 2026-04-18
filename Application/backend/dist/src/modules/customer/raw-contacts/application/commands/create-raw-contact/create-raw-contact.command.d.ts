export declare class CreateRawContactCommand {
    readonly firstName: string;
    readonly lastName: string;
    readonly createdById: string;
    readonly source?: string | undefined;
    readonly companyName?: string | undefined;
    readonly designation?: string | undefined;
    readonly department?: string | undefined;
    readonly notes?: string | undefined;
    readonly communications?: Array<{
        type: string;
        value: string;
        priorityType?: string;
        label?: string;
        isPrimary?: boolean;
    }> | undefined;
    readonly filterIds?: string[] | undefined;
    constructor(firstName: string, lastName: string, createdById: string, source?: string | undefined, companyName?: string | undefined, designation?: string | undefined, department?: string | undefined, notes?: string | undefined, communications?: Array<{
        type: string;
        value: string;
        priorityType?: string;
        label?: string;
        isPrimary?: boolean;
    }> | undefined, filterIds?: string[] | undefined);
}
