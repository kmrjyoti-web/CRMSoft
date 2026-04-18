import { PrismaService } from '../../../../core/prisma/prisma.service';
import type { AddCountryDto, AddStatesDto, AddCitiesDto, AddPincodesDto, AddPincodeRangeDto, CheckAreaDto } from '../presentation/dto/company/company-locations.dto';
export declare class CompanyLocationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getLocationTree(tenantId: string): Promise<({
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
    })[]>;
    getSummary(tenantId: string): Promise<{
        countries: number;
        states: number;
        cities: number;
        pincodes: number;
    }>;
    addCountry(tenantId: string, dto: AddCountryDto): Promise<{
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
    }>;
    addStates(tenantId: string, countryId: string, dto: AddStatesDto): Promise<any[]>;
    addCities(tenantId: string, stateId: string, dto: AddCitiesDto): Promise<any[]>;
    addPincodes(tenantId: string, cityId: string, dto: AddPincodesDto): Promise<{
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
    }[]>;
    addPincodeRange(tenantId: string, cityId: string, dto: AddPincodeRangeDto): Promise<{
        added: number;
    }>;
    removeCountry(tenantId: string, id: string): Promise<void>;
    removeState(tenantId: string, id: string): Promise<void>;
    removeCity(tenantId: string, id: string): Promise<void>;
    removePincode(tenantId: string, id: string): Promise<void>;
    updateState(tenantId: string, id: string, data: Partial<{
        coverageType: string;
        isHeadquarter: boolean;
        stateGstin: string;
    }>): Promise<import("@prisma/working-client").Prisma.BatchPayload>;
    updateCity(tenantId: string, id: string, data: Partial<{
        coverageType: string;
        district: string;
    }>): Promise<import("@prisma/working-client").Prisma.BatchPayload>;
    getAllCountries(): {
        name: string;
        code: string;
        phonecode: string;
        currency: string;
        flag: string;
    }[];
    getStatesOfCountry(countryCode: string): {
        name: string;
        code: string;
        countryCode: string;
        gstStateCode: string | undefined;
    }[];
    getCitiesOfState(countryCode: string, stateCode: string): {
        name: string;
        stateCode: string;
        countryCode: string;
    }[];
    getGstStateCodes(): import("../data/gst-state-codes").GstStateCode[];
    checkOperatingArea(tenantId: string, dto: CheckAreaDto): Promise<{
        isInArea: boolean;
        isSameState: boolean;
        gstType: "INTER" | "INTRA";
        companyGstStateCode: string | null;
        customerGstStateCode: string | null;
        message: string;
    }>;
    determineGstType(tenantId: string, customerStateCode: string): Promise<{
        gstType: 'INTRA' | 'INTER';
        companyGstStateCode: string | null;
        customerGstStateCode: string | null;
    }>;
}
