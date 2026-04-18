import { CommunicationEntity } from '../entities/communication.entity';
export interface ICommunicationRepository {
    findById(id: string): Promise<CommunicationEntity | null>;
    save(communication: CommunicationEntity): Promise<void>;
    delete(id: string): Promise<void>;
    findPrimaryByEntity(entityField: string, entityId: string, type: string): Promise<CommunicationEntity | null>;
}
export declare const COMMUNICATION_REPOSITORY = "ICommunicationRepository";
