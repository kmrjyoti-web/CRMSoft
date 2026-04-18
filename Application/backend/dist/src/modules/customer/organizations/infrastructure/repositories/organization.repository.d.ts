import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IOrganizationRepository } from '../../domain/interfaces/organization-repository.interface';
import { OrganizationEntity } from '../../domain/entities/organization.entity';
export declare class OrganizationRepository implements IOrganizationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<OrganizationEntity | null>;
    findByName(name: string): Promise<OrganizationEntity | null>;
    save(entity: OrganizationEntity): Promise<void>;
    delete(id: string): Promise<void>;
}
