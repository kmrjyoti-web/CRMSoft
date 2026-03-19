import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ICommunicationRepository } from '../../domain/interfaces/communication-repository.interface';
import { CommunicationEntity } from '../../domain/entities/communication.entity';
import { CommunicationMapper } from '../mappers/communication.mapper';

@Injectable()
export class CommunicationRepository implements ICommunicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CommunicationEntity | null> {
    const record = await this.prisma.communication.findUnique({ where: { id } });
    return record ? CommunicationMapper.toDomain(record) : null;
  }

  async save(entity: CommunicationEntity): Promise<void> {
    const data = CommunicationMapper.toPersistence(entity);
    await this.prisma.communication.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.communication.delete({ where: { id } });
  }

  async findPrimaryByEntity(
    entityField: string, entityId: string, type: string,
  ): Promise<CommunicationEntity | null> {
    const where: any = { [entityField]: entityId, type, isPrimary: true };
    const record = await this.prisma.communication.findFirst({ where });
    return record ? CommunicationMapper.toDomain(record) : null;
  }
}
