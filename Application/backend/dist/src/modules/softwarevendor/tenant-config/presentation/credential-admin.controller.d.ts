import { CredentialProvider } from '@prisma/identity-client';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EncryptionService } from '../services/encryption.service';
import { CredentialSchemaService } from '../services/credential-schema.service';
import { GlobalDefaultCredentialDto } from './dto/global-default-credential.dto';
export declare class CredentialAdminController {
    private readonly prisma;
    private readonly encryption;
    private readonly schemaService;
    constructor(prisma: PrismaService, encryption: EncryptionService, schemaService: CredentialSchemaService);
    listDefaults(): Promise<ApiResponse<{
        id: string;
        provider: import("@prisma/identity-client").$Enums.CredentialProvider;
        status: import("@prisma/identity-client").$Enums.CredentialStatus;
        description: string | null;
        isEnabled: boolean;
        maskedCredentials: Record<string, string>;
        createdAt: Date;
        updatedAt: Date;
    }[]>>;
    createDefault(dto: GlobalDefaultCredentialDto): Promise<ApiResponse<null> | ApiResponse<{
        id: string;
    }>>;
    updateDefault(provider: CredentialProvider, dto: GlobalDefaultCredentialDto): Promise<ApiResponse<null>>;
    rotateKey(body: {
        oldKey: string;
        newKey: string;
    }): Promise<ApiResponse<{
        rotated: number;
    }>>;
}
