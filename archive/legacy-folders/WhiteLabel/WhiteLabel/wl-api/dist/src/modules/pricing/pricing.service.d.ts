import { PrismaService } from '../prisma/prisma.service';
export declare class PricingService {
    private prisma;
    constructor(prisma: PrismaService);
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
    updateService(serviceCode: string, dto: any): Promise<{
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
    setPartnerPricing(dto: {
        partnerId: string;
        serviceCode: string;
        pricePerUnit: number;
        customerMinPrice?: number;
        customerSuggestedPrice?: number;
    }): Promise<{
        id: string;
        serviceCode: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        pricePerUnit: import("@prisma/client-runtime-utils").Decimal;
        customerMinPrice: import("@prisma/client-runtime-utils").Decimal | null;
        customerSuggestedPrice: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    setCustomerPricing(dto: {
        partnerId: string;
        serviceCode: string;
        customerPricePerUnit: number;
        isCustomizable?: boolean;
    }): Promise<{
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
