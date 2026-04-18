import { PrismaClient } from '@prisma/client';
export declare function seedRawContacts(prisma: PrismaClient, adminUserId: string, tenantId: string, count?: number): Promise<void>;
