import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { LinkBrandOrganizationDto, LinkBrandContactDto } from './dto/link-brand.dto';
export declare class BrandsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateBrandDto): Promise<ApiResponse<{
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
    }[]>>;
    findOne(id: string): Promise<ApiResponse<{
        brandContacts: ({
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
            brandId: string;
        })[];
        brandOrganizations: ({
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
            brandId: string;
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
    }>>;
    update(id: string, dto: UpdateBrandDto): Promise<ApiResponse<{
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
    }>>;
    linkOrganization(id: string, dto: LinkBrandOrganizationDto): Promise<ApiResponse<{
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
        brandId: string;
    }>>;
    unlinkOrganization(id: string, orgId: string): Promise<ApiResponse<null>>;
    linkContact(id: string, dto: LinkBrandContactDto): Promise<ApiResponse<{
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
        brandId: string;
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
        brandId: string;
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
        brandId: string;
    })[]>>;
}
