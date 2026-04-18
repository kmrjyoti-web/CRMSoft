export declare class CreateSoftwareOfferDto {
    name: string;
    code: string;
    description?: string;
    offerType: string;
    value: number;
    applicablePlanIds?: string[];
    validFrom: string;
    validTo: string;
    maxRedemptions?: number;
    autoApply?: boolean;
    terms?: string;
}
