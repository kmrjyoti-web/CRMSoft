export declare class UpdateCapacityDto {
    maxLeads?: number;
    maxContacts?: number;
    maxOrganizations?: number;
    maxQuotations?: number;
    maxTotal?: number;
}
export declare class SetAvailabilityDto {
    userId: string;
    isAvailable: boolean;
    unavailableFrom?: string;
    unavailableTo?: string;
    delegateToId?: string;
    reason?: string;
}
