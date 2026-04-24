import { PricingService } from './pricing.service';
export declare class PricingController {
    private pricingService;
    constructor(pricingService: PricingService);
    listServices(): Promise<{
        id: string;
        serviceCode: string;
        serviceName: string;
        unitDescription: string;
        baseCostPerUnit: import("@prisma/client-runtime-utils").Decimal;
        defaultPartnerPrice: import("@prisma/client-runtime-utils").Decimal;
        defaultCustomerPrice: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createService(dto: any): Promise<{
        id: string;
        serviceCode: string;
        serviceName: string;
        unitDescription: string;
        baseCostPerUnit: import("@prisma/client-runtime-utils").Decimal;
        defaultPartnerPrice: import("@prisma/client-runtime-utils").Decimal;
        defaultCustomerPrice: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateService(code: string, dto: any): Promise<{
        id: string;
        serviceCode: string;
        serviceName: string;
        unitDescription: string;
        baseCostPerUnit: import("@prisma/client-runtime-utils").Decimal;
        defaultPartnerPrice: import("@prisma/client-runtime-utils").Decimal;
        defaultCustomerPrice: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPartnerPricing(partnerId: string): Promise<({
        service: {
            id: string;
            serviceCode: string;
            serviceName: string;
            unitDescription: string;
            baseCostPerUnit: import("@prisma/client-runtime-utils").Decimal;
            defaultPartnerPrice: import("@prisma/client-runtime-utils").Decimal;
            defaultCustomerPrice: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        serviceCode: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        pricePerUnit: import("@prisma/client-runtime-utils").Decimal;
        customerMinPrice: import("@prisma/client-runtime-utils").Decimal | null;
        customerSuggestedPrice: import("@prisma/client-runtime-utils").Decimal | null;
    })[]>;
    setPartnerPricing(dto: any): Promise<{
        id: string;
        serviceCode: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        pricePerUnit: import("@prisma/client-runtime-utils").Decimal;
        customerMinPrice: import("@prisma/client-runtime-utils").Decimal | null;
        customerSuggestedPrice: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    updatePartnerPricing(id: string, dto: any): Promise<{
        id: string;
        serviceCode: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        pricePerUnit: import("@prisma/client-runtime-utils").Decimal;
        customerMinPrice: import("@prisma/client-runtime-utils").Decimal | null;
        customerSuggestedPrice: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    setCustomerPricing(dto: any): Promise<{
        id: string;
        serviceCode: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        customerPricePerUnit: import("@prisma/client-runtime-utils").Decimal;
        isCustomizable: boolean;
    }>;
    updateCustomerPricing(id: string, dto: any): Promise<{
        id: string;
        serviceCode: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        customerPricePerUnit: import("@prisma/client-runtime-utils").Decimal;
        isCustomizable: boolean;
    }>;
    getPricingChain(partnerId: string, serviceCode: string): Promise<{
        service: {
            id: string;
            serviceCode: string;
            serviceName: string;
            unitDescription: string;
            baseCostPerUnit: import("@prisma/client-runtime-utils").Decimal;
            defaultPartnerPrice: import("@prisma/client-runtime-utils").Decimal;
            defaultCustomerPrice: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        partnerPricing: {
            id: string;
            serviceCode: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            pricePerUnit: import("@prisma/client-runtime-utils").Decimal;
            customerMinPrice: import("@prisma/client-runtime-utils").Decimal | null;
            customerSuggestedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        } | null;
        customerPricing: {
            id: string;
            serviceCode: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            customerPricePerUnit: import("@prisma/client-runtime-utils").Decimal;
            isCustomizable: boolean;
        } | null;
        margins: {
            yourMarginPerUnit: number | null;
            partnerMarginPerUnit: number | null;
        };
    }>;
}
