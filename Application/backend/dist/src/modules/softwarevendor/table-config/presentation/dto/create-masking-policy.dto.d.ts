export declare class CreateMaskingPolicyDto {
    tableKey: string;
    columnId: string;
    roleId?: string;
    userId?: string;
    maskType: string;
    canUnmask?: boolean;
}
export declare class UpdateMaskingPolicyDto {
    maskType?: string;
    canUnmask?: boolean;
    isActive?: boolean;
}
