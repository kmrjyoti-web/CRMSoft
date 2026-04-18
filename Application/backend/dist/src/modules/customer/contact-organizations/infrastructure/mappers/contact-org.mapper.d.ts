import { ContactOrganizationEntity } from '../../domain/entities/contact-organization.entity';
export declare class ContactOrgMapper {
    static toDomain(raw: Record<string, unknown>): ContactOrganizationEntity;
    static toPersistence(entity: ContactOrganizationEntity): any;
}
