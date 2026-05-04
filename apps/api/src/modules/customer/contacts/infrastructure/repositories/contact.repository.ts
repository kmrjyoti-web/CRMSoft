import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IContactRepository } from '../../domain/interfaces/contact-repository.interface';
import { ContactEntity } from '../../domain/entities/contact.entity';
import { ContactMapper } from '../mappers/contact.mapper';

@Injectable()
export class ContactRepository implements IContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ContactEntity | null> {
    const record = await this.prisma.working.contact.findUnique({ where: { id } });
    return record ? ContactMapper.toDomain(record) : null;
  }

  async save(entity: ContactEntity): Promise<void> {
    const data = ContactMapper.toPersistence(entity);
    await this.prisma.working.contact.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.working.contact.delete({ where: { id } });
  }
}
