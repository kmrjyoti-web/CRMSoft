export declare class CreatePriceGroupDto {
    name: string;
    code: string;
    description?: string;
    discount?: number;
    priority?: number;
}
export declare class UpdatePriceGroupDto {
    name?: string;
    code?: string;
    description?: string;
    discount?: number;
    priority?: number;
    isActive?: boolean;
}
export declare class AddMemberDto {
    contactId?: string;
    organizationId?: string;
}
