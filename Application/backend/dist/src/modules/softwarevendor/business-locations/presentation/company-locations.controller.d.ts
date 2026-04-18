import { ApiResponse } from '../../../../common/utils/api-response';
import { CompanyLocationsService } from '../services/company-locations.service';
import { AddCountryDto, AddStatesDto, AddCitiesDto, AddPincodesDto, AddPincodeRangeDto, CheckAreaDto } from './dto/company/company-locations.dto';
export declare class CompanyLocationsController {
    private readonly svc;
    constructor(svc: CompanyLocationsService);
    private getTenantId;
    getTree(req: any): Promise<ApiResponse<({
        states: ({
            cities: ({
                pincodes: {
                    id: string;
                    tenantId: string;
                    isActive: boolean;
                    isDeleted: boolean;
                    deletedAt: Date | null;
                    deletedById: string | null;
                    updatedById: string | null;
                    updatedByName: string | null;
                    pincode: string;
                    areaName: string | null;
                    companyCityId: string;
                }[];
            } & {
                id: string;
                tenantId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
                deletedById: string | null;
                updatedById: string | null;
                updatedByName: string | null;
                coverageType: string;
                district: string | null;
                cityName: string;
                companyStateId: string;
            })[];
        } & {
            id: string;
            tenantId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            coverageType: string;
            stateCode: string;
            gstStateCode: string | null;
            isHeadquarter: boolean;
            stateGstin: string | null;
            stateName: string;
            companyCountryId: string;
        })[];
    } & {
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        currency: string | null;
        currencySymbol: string | null;
        countryCode: string;
        isPrimary: boolean;
        countryName: string;
        isoCode3: string | null;
        phonecode: string | null;
    })[]>>;
    getSummary(req: any): Promise<ApiResponse<{
        countries: number;
        states: number;
        cities: number;
        pincodes: number;
    }>>;
    getAllCountries(): Promise<ApiResponse<{
        name: string;
        code: string;
        phonecode: string;
        currency: string;
        flag: string;
    }[]>>;
    getStates(countryCode: string): Promise<ApiResponse<{
        name: string;
        code: string;
        countryCode: string;
        gstStateCode: string | undefined;
    }[]>>;
    getCities(countryCode: string, stateCode: string): Promise<ApiResponse<{
        name: string;
        stateCode: string;
        countryCode: string;
    }[]>>;
    getGstCodes(): Promise<ApiResponse<import("../data/gst-state-codes").GstStateCode[]>>;
    checkArea(req: any, dto: CheckAreaDto): Promise<ApiResponse<{
        isInArea: boolean;
        isSameState: boolean;
        gstType: "INTER" | "INTRA";
        companyGstStateCode: string | null;
        customerGstStateCode: string | null;
        message: string;
    }>>;
    getGstType(req: any, customerStateCode: string): Promise<ApiResponse<{
        gstType: "INTRA" | "INTER";
        companyGstStateCode: string | null;
        customerGstStateCode: string | null;
    }>>;
    addCountry(req: any, dto: AddCountryDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        currency: string | null;
        currencySymbol: string | null;
        countryCode: string;
        isPrimary: boolean;
        countryName: string;
        isoCode3: string | null;
        phonecode: string | null;
    }>>;
    removeCountry(req: any, id: string): Promise<ApiResponse<null>>;
    addStates(req: any, countryId: string, dto: AddStatesDto): Promise<ApiResponse<any[]>>;
    updateState(req: any, id: string, body: {
        coverageType?: string;
        isHeadquarter?: boolean;
        stateGstin?: string;
    }): Promise<ApiResponse<null>>;
    removeState(req: any, id: string): Promise<ApiResponse<null>>;
    addCities(req: any, stateId: string, dto: AddCitiesDto): Promise<ApiResponse<any[]>>;
    updateCity(req: any, id: string, body: {
        coverageType?: string;
        district?: string;
    }): Promise<ApiResponse<null>>;
    removeCity(req: any, id: string): Promise<ApiResponse<null>>;
    addPincodes(req: any, cityId: string, dto: AddPincodesDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isActive: boolean;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        pincode: string;
        areaName: string | null;
        companyCityId: string;
    }[]>>;
    addPincodeRange(req: any, cityId: string, dto: AddPincodeRangeDto): Promise<ApiResponse<{
        added: number;
    }>>;
    removePincode(req: any, id: string): Promise<ApiResponse<null>>;
}
