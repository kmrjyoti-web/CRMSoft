export declare class UpdateTemplateCommand {
    readonly id: string;
    readonly subject?: string | undefined;
    readonly body?: string | undefined;
    readonly channels?: string[] | undefined;
    readonly variables?: string[] | undefined;
    readonly isActive?: boolean | undefined;
    constructor(id: string, subject?: string | undefined, body?: string | undefined, channels?: string[] | undefined, variables?: string[] | undefined, isActive?: boolean | undefined);
}
