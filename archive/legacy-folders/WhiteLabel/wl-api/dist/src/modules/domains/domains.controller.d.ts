import { DomainsService } from './domains.service';
import { DomainType } from '@prisma/client';
declare class AddDomainDto {
    partnerId: string;
    domain: string;
    domainType: DomainType;
}
export declare class DomainsController {
    private domainsService;
    constructor(domainsService: DomainsService);
    add(dto: AddDomainDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        domain: string;
        domainType: import("@prisma/client").$Enums.DomainType;
        sslStatus: import("@prisma/client").$Enums.SslStatus;
        sslCertPath: string | null;
        sslExpiresAt: Date | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        dnsRecords: import("@prisma/client/runtime/client").JsonValue | null;
        verificationToken: string | null;
    }>;
    listByPartner(partnerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        domain: string;
        domainType: import("@prisma/client").$Enums.DomainType;
        sslStatus: import("@prisma/client").$Enums.SslStatus;
        sslCertPath: string | null;
        sslExpiresAt: Date | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        dnsRecords: import("@prisma/client/runtime/client").JsonValue | null;
        verificationToken: string | null;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        domain: string;
        domainType: import("@prisma/client").$Enums.DomainType;
        sslStatus: import("@prisma/client").$Enums.SslStatus;
        sslCertPath: string | null;
        sslExpiresAt: Date | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        dnsRecords: import("@prisma/client/runtime/client").JsonValue | null;
        verificationToken: string | null;
    }>;
    verify(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        domain: string;
        domainType: import("@prisma/client").$Enums.DomainType;
        sslStatus: import("@prisma/client").$Enums.SslStatus;
        sslCertPath: string | null;
        sslExpiresAt: Date | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        dnsRecords: import("@prisma/client/runtime/client").JsonValue | null;
        verificationToken: string | null;
    }>;
    getDnsRecords(id: string): Promise<{
        domain: string;
        verificationToken: string | null;
        dnsRecords: import("@prisma/client/runtime/client").JsonValue;
    }>;
}
export {};
