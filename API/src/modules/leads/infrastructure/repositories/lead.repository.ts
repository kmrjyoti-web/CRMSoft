import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ILeadRepository } from '../../domain/interfaces/lead-repository.interface';
import { LeadEntity } from '../../domain/entities/lead.entity';
import { LeadMapper } from '../mappers/lead.mapper';

@Injectable()
export class LeadRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<LeadEntity | null> {
    const record = await this.prisma.lead.findUnique({ where: { id } });
    return record ? LeadMapper.toDomain(record) : null;
  }

  async save(entity: LeadEntity, tx?: any): Promise<void> {
    const data = LeadMapper.toPersistence(entity);
    const client = tx || this.prisma;
    await client.lead.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lead.delete({ where: { id } });
  }

  /**
   * Generate next lead number: LD-00001, LD-00002, etc.
   * Uses DB count + 1 for simplicity. In production, use a sequence table.
   */
  async nextLeadNumber(tx?: any): Promise<string> {
    const client = tx || this.prisma;
    const count = await client.lead.count();
    const next = count + 1;
    return `LD-${String(next).padStart(5, '0')}`;
  }
}
