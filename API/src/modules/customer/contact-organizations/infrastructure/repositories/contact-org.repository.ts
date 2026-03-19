import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IContactOrgRepository } from '../../domain/interfaces/contact-org-repository.interface';
import { ContactOrganizationEntity } from '../../domain/entities/contact-organization.entity';
import { ContactOrgMapper } from '../mappers/contact-org.mapper';

@Injectable()
export class ContactOrgRepository implements IContactOrgRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ContactOrganizationEntity | null> {
    const record = await this.prisma.contactOrganization.findUnique({ where: { id } });
    return record ? ContactOrgMapper.toDomain(record) : null;
  }

  async findByContactAndOrg(contactId: string, organizationId: string): Promise<ContactOrganizationEntity | null> {
    const record = await this.prisma.contactOrganization.findFirst({
      where: { contactId, organizationId },
    });
    return record ? ContactOrgMapper.toDomain(record) : null;
  }

  async save(entity: ContactOrganizationEntity): Promise<void> {
    const data = ContactOrgMapper.toPersistence(entity);
    await this.prisma.contactOrganization.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contactOrganization.delete({ where: { id } });
  }
}
