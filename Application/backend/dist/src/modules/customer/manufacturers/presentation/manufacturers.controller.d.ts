import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { LinkManufacturerOrganizationDto, LinkManufacturerContactDto } from './dto/link-manufacturer.dto';
export declare class ManufacturersController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateManufacturerDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        name: string;
        code: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        website: string | null;
        logo: string | null;
        country: string | null;
    }>>;
    findAll(page?: string, limit?: string, search?: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        name: string;
        code: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        website: string | null;
        logo: string | null;
        country: string | null;
    }[]>>;
    findOne(id: string): Promise<ApiResponse<{
        manufacturerContacts: ({
            contact: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            contactId: string;
            isPrimary: boolean;
            role: string | null;
            manufacturerId: string;
        })[];
        manufacturerOrganizations: ({
            organization: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            notes: string | null;
            isPrimary: boolean;
            organizationId: string;
            manufacturerId: string;
        })[];
    } & {
        id: string;
        tenantId: string;
        name: string;
        code: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        website: string | null;
        logo: string | null;
        country: string | null;
    }>>;
    update(id: string, dto: UpdateManufacturerDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        name: string;
        code: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        website: string | null;
        logo: string | null;
        country: string | null;
    }>>;
    deactivate(id: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        name: string;
        code: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        website: string | null;
        logo: string | null;
        country: string | null;
    }>>;
    linkOrg(id: string, dto: LinkManufacturerOrganizationDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        notes: string | null;
        isPrimary: boolean;
        organizationId: string;
        manufacturerId: string;
    }>>;
    unlinkOrg(id: string, orgId: string): Promise<ApiResponse<null>>;
    linkContact(id: string, dto: LinkManufacturerContactDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        contactId: string;
        isPrimary: boolean;
        role: string | null;
        manufacturerId: string;
    }>>;
    unlinkContact(id: string, contactId: string): Promise<ApiResponse<null>>;
    getOrganizations(id: string): Promise<ApiResponse<({
        organization: {
            id: string;
            name: string;
            city: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        notes: string | null;
        isPrimary: boolean;
        organizationId: string;
        manufacturerId: string;
    })[]>>;
    getContacts(id: string): Promise<ApiResponse<({
        contact: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        contactId: string;
        isPrimary: boolean;
        role: string | null;
        manufacturerId: string;
    })[]>>;
}
