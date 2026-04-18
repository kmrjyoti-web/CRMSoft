import { ContactOrganizationEntity } from '../entities/contact-organization.entity';
export interface IContactOrgRepository {
    findById(id: string): Promise<ContactOrganizationEntity | null>;
    findByContactAndOrg(contactId: string, organizationId: string): Promise<ContactOrganizationEntity | null>;
    save(entity: ContactOrganizationEntity): Promise<void>;
    delete(id: string): Promise<void>;
}
export declare const CONTACT_ORG_REPOSITORY = "IContactOrgRepository";
