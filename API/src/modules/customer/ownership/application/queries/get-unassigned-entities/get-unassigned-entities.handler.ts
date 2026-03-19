import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUnassignedEntitiesQuery } from './get-unassigned-entities.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetUnassignedEntitiesQuery)
export class GetUnassignedEntitiesHandler implements IQueryHandler<GetUnassignedEntitiesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUnassignedEntitiesQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    // Get all entity IDs that have active PRIMARY_OWNER
    const ownedIds = await this.prisma.entityOwner.findMany({
      where: { entityType: query.entityType as any, ownerType: 'PRIMARY_OWNER', isActive: true },
      select: { entityId: true },
    });
    const ownedSet = new Set(ownedIds.map((o) => o.entityId));

    let entities: any[] = [];
    let total = 0;

    switch (query.entityType) {
      case 'LEAD': {
        const all = await this.prisma.lead.findMany({
          select: { id: true, leadNumber: true, status: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        });
        const unassigned = all.filter((e) => !ownedSet.has(e.id));
        total = unassigned.length;
        entities = unassigned.slice((page - 1) * limit, page * limit);
        break;
      }
      case 'CONTACT': {
        const all = await this.prisma.contact.findMany({
          where: { isActive: true }, select: { id: true, firstName: true, lastName: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        });
        const unassigned = all.filter((e) => !ownedSet.has(e.id));
        total = unassigned.length;
        entities = unassigned.slice((page - 1) * limit, page * limit);
        break;
      }
      case 'ORGANIZATION': {
        const all = await this.prisma.organization.findMany({
          where: { isActive: true }, select: { id: true, name: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        });
        const unassigned = all.filter((e) => !ownedSet.has(e.id));
        total = unassigned.length;
        entities = unassigned.slice((page - 1) * limit, page * limit);
        break;
      }
      case 'QUOTATION': {
        const all = await this.prisma.quotation.findMany({
          select: { id: true, quotationNo: true, status: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        });
        const unassigned = all.filter((e) => !ownedSet.has(e.id));
        total = unassigned.length;
        entities = unassigned.slice((page - 1) * limit, page * limit);
        break;
      }
    }

    return { data: entities, total, page, limit, entityType: query.entityType };
  }
}
