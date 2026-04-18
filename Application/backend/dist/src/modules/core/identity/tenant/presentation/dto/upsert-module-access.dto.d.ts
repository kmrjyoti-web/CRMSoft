declare class ModuleAccessItemDto {
    moduleCode: string;
    accessLevel: string;
    customConfig?: Record<string, unknown>;
}
export declare class UpsertModuleAccessDto {
    modules: ModuleAccessItemDto[];
}
export {};
