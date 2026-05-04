import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IRawContactRepository } from '../../domain/interfaces/raw-contact-repository.interface';
import { RawContactEntity } from '../../domain/entities/raw-contact.entity';
import { RawContactMapper } from '../mappers/raw-contact.mapper';

@Injectable()
export class RawContactRepository implements IRawContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<RawContactEntity | null> {
    const record = await this.prisma.working.rawContact.findUnique({ where: { id } });
    return record ? RawContactMapper.toDomain(record) : null;
  }

  async save(entity: RawContactEntity): Promise<void> {
    const data = RawContactMapper.toPersistence(entity);
    await this.prisma.working.rawContact.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.working.rawContact.delete({ where: { id } });
  }
}
