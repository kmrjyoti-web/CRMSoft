import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IContactRepository } from '../../domain/interfaces/contact-repository.interface';
import { ContactEntity } from '../../domain/entities/contact.entity';
export declare class ContactRepository implements IContactRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<ContactEntity | null>;
    save(entity: ContactEntity): Promise<void>;
    delete(id: string): Promise<void>;
}
