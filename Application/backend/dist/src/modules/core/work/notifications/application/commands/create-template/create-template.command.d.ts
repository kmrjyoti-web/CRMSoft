export declare class CreateTemplateCommand {
    readonly name: string;
    readonly category: string;
    readonly subject: string;
    readonly body: string;
    readonly channels?: string[] | undefined;
    readonly variables?: string[] | undefined;
    constructor(name: string, category: string, subject: string, body: string, channels?: string[] | undefined, variables?: string[] | undefined);
}
