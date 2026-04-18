import { ContactEntity } from '../entities/contact.entity';
export interface IContactRepository {
    findById(id: string): Promise<ContactEntity | null>;
    save(contact: ContactEntity): Promise<void>;
    delete(id: string): Promise<void>;
}
export declare const CONTACT_REPOSITORY = "IContactRepository";
