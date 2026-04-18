import { CommunicationEntity } from '../../domain/entities/communication.entity';
export declare class CommunicationMapper {
    static toDomain(raw: Record<string, unknown>): CommunicationEntity;
    static toPersistence(entity: CommunicationEntity): any;
}
