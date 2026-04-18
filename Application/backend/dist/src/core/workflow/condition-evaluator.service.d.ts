import { ConditionConfig } from './interfaces/workflow-types.interface';
export declare class ConditionEvaluatorService {
    evaluate(conditionConfig: ConditionConfig | null | undefined, entityData: Record<string, any>): boolean;
    private evaluateCondition;
    private getFieldValue;
}
