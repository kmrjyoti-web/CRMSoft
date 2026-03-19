import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IOrganizationRepository } from '../../domain/interfaces/organization-repository.interface';
import { OrganizationEntity } from '../../domain/entities/organization.entity';
import { OrganizationMapper } from '../mappers/organization.mapper';

@Injectable()
export class OrganizationRepository implements IOrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<OrganizationEntity | null> {
    const record = await this.prisma.organization.findUnique({ where: { id } });
    return record ? OrganizationMapper.toDomain(record) : null;
  }

  async findByName(name: string): Promise<OrganizationEntity | null> {
    const record = await this.prisma.organization.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    return record ? OrganizationMapper.toDomain(record) : null;
  }

  async save(entity: OrganizationEntity): Promise<void> {
    const data = OrganizationMapper.toPersistence(entity);
    await this.prisma.organization.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({ where: { id } });
  }
}
