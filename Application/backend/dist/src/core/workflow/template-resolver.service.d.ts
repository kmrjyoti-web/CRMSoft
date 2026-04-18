import { WorkflowActionContext } from './interfaces/action-handler.interface';
export declare class TemplateResolverService {
    resolve(template: string, context: WorkflowActionContext): string;
    resolveObject(obj: any, context: WorkflowActionContext): any;
    private getValue;
    private getNestedValue;
}
