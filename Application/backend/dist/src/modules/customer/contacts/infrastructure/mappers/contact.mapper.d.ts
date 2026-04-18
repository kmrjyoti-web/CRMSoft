import { ContactEntity } from '../../domain/entities/contact.entity';
export declare class ContactMapper {
    static toDomain(raw: Record<string, unknown>): ContactEntity;
    static toPersistence(entity: ContactEntity): any;
}
