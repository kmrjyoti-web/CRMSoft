import { OrganizationEntity } from '../../domain/entities/organization.entity';
export declare class OrganizationMapper {
    static toDomain(raw: Record<string, unknown>): OrganizationEntity;
    static toPersistence(entity: OrganizationEntity): any;
}
