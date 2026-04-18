import { RawContactEntity } from '../../domain/entities/raw-contact.entity';
export declare class RawContactMapper {
    static toDomain(raw: Record<string, unknown>): RawContactEntity;
    static toPersistence(entity: RawContactEntity): any;
}
