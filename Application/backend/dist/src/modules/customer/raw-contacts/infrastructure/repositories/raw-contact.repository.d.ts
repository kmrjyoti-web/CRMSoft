import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IRawContactRepository } from '../../domain/interfaces/raw-contact-repository.interface';
import { RawContactEntity } from '../../domain/entities/raw-contact.entity';
export declare class RawContactRepository implements IRawContactRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<RawContactEntity | null>;
    save(entity: RawContactEntity): Promise<void>;
    delete(id: string): Promise<void>;
}
