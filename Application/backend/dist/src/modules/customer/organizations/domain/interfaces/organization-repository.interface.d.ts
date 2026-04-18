import { OrganizationEntity } from '../entities/organization.entity';
export interface IOrganizationRepository {
    findById(id: string): Promise<OrganizationEntity | null>;
    findByName(name: string): Promise<OrganizationEntity | null>;
    save(organization: OrganizationEntity): Promise<void>;
    delete(id: string): Promise<void>;
}
export declare const ORGANIZATION_REPOSITORY = "IOrganizationRepository";
