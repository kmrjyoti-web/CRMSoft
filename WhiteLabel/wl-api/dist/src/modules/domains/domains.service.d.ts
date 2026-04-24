import { PrismaService } from '../prisma/prisma.service';
import { DomainType } from '@prisma/client';
export declare class DomainsService {
    private prisma;
    constructor(prisma: PrismaService);
    add(dto: {
        partnerId: string;
        domain: string;
        domainType: DomainType;
    }): Promise<{
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
