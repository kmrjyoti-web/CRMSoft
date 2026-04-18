export interface LookupSeedValue {
    value: string;
    label: string;
    icon?: string;
    color?: string;
}
export interface LookupSeedCategory {
    category: string;
    displayName: string;
    isSystem: boolean;
    values: LookupSeedValue[];
}
export declare const LOOKUP_SEED_DATA: LookupSeedCategory[];
