import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IContactOrgRepository } from '../../domain/interfaces/contact-org-repository.interface';
import { ContactOrganizationEntity } from '../../domain/entities/contact-organization.entity';
export declare class ContactOrgRepository implements IContactOrgRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<ContactOrganizationEntity | null>;
    findByContactAndOrg(contactId: string, organizationId: string): Promise<ContactOrganizationEntity | null>;
    save(entity: ContactOrganizationEntity): Promise<void>;
    delete(id: string): Promise<void>;
}
