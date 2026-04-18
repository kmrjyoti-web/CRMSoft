import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ICommunicationRepository } from '../../domain/interfaces/communication-repository.interface';
import { CommunicationEntity } from '../../domain/entities/communication.entity';
export declare class CommunicationRepository implements ICommunicationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<CommunicationEntity | null>;
    save(entity: CommunicationEntity): Promise<void>;
    delete(id: string): Promise<void>;
    findPrimaryByEntity(entityField: string, entityId: string, type: string): Promise<CommunicationEntity | null>;
}
