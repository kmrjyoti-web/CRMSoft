export declare class AddCountryDto {
    countryCode: string;
    isPrimary?: boolean;
}
export declare class StateItemDto {
    stateCode: string;
    coverageType: 'ALL_CITIES' | 'SPECIFIC';
    isHeadquarter?: boolean;
    stateGstin?: string;
}
export declare class AddStatesDto {
    states: StateItemDto[];
}
export declare class CityItemDto {
    cityName: string;
    coverageType: 'ALL_PINCODES' | 'SPECIFIC';
    district?: string;
}
export declare class AddCitiesDto {
    cities: CityItemDto[];
}
export declare class PincodeItemDto {
    pincode: string;
    areaName?: string;
}
export declare class AddPincodesDto {
    pincodes: PincodeItemDto[];
}
export declare class AddPincodeRangeDto {
    fromPincode: string;
    toPincode: string;
}
export declare class CheckAreaDto {
    customerPincode: string;
    customerStateCode: string;
}
