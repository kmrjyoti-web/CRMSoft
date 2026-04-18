import { RawContactEntity } from '../entities/raw-contact.entity';
export interface IRawContactRepository {
    findById(id: string): Promise<RawContactEntity | null>;
    save(rawContact: RawContactEntity): Promise<void>;
    delete(id: string): Promise<void>;
}
export declare const RAW_CONTACT_REPOSITORY = "IRawContactRepository";
