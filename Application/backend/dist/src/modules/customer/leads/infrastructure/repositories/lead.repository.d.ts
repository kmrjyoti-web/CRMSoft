import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ILeadRepository } from '../../domain/interfaces/lead-repository.interface';
import { LeadEntity } from '../../domain/entities/lead.entity';
export declare class LeadRepository implements ILeadRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<LeadEntity | null>;
    save(entity: LeadEntity, tx?: any): Promise<void>;
    delete(id: string): Promise<void>;
    nextLeadNumber(tx?: any): Promise<string>;
}
