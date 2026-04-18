import 'reflect-metadata';
export type ServiceBoundary = 'vendor' | 'identity' | 'work';
export interface CrossServiceMetadata {
    targetService: ServiceBoundary;
    reason: string;
    sourceName: string;
    method?: string;
}
export declare function CrossService(targetService: ServiceBoundary, reason: string): MethodDecorator & ClassDecorator;
export declare function getCrossServiceDeps(target: object): CrossServiceMetadata[];
