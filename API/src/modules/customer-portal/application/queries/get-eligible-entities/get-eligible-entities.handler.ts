import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEligibleEntitiesQuery } from './get-eligible-entities.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { paginate } from '../../../../../common/types/paginated.type';

interface EligibleEntity {
  id: string;
  entityType: string;
  name: string;
  email: string | null;
  phone: string | null;
  isAlreadyActivated: boolean;
}

@QueryHandler(GetEligibleEntitiesQuery)
export class GetEligibleEntitiesHandler implements IQueryHandler<GetEligibleEntitiesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEligibleEntitiesQuery) {
    const { tenantId, entityType, search, page, limit } = query;
    const skip = (page - 1) * limit;

    // Get already-activated entity IDs to exclude/mark
    const activatedUsers = await this.prisma.identity.customerUser.findMany({
      where: { tenantId, isDeleted: false },
      select: { linkedEntityType: true, linkedEntityId: true },
    });
    const activatedSet = new Set(
      activatedUsers.map((u) => `${u.linkedEntityType}:${u.linkedEntityId}`),
    );

    const workingClient = await this.prisma.getWorkingClient(tenantId);
    const results: EligibleEntity[] = [];

    if (!entityType || entityType === 'CONTACT') {
      const where = {
        tenantId,
        isDeleted: false,
        entityVerificationStatus: 'VERIFIED',
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' as const } },
                { lastName: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      };

      const contacts = await (workingClient as any).contact.findMany({
        where,
        take: limit,
        skip,
        include: {
          communications: { where: { type: 'EMAIL' }, take: 1, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { firstName: 'asc' },
      });

      for (const c of contacts) {
        results.push({
          id: c.id,
          entityType: 'CONTACT',
          name: `${c.firstName} ${c.lastName}`.trim(),
          email: c.communications?.[0]?.value ?? null,
          phone: null,
          isAlreadyActivated: activatedSet.has(`CONTACT:${c.id}`),
        });
      }
    }

    if (!entityType || entityType === 'ORGANIZATION') {
      const where = {
        tenantId,
        isDeleted: false,
        entityVerificationStatus: 'VERIFIED',
        ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
      };

      const orgs = await (workingClient as any).organization.findMany({
        where,
        take: limit,
        skip,
        orderBy: { name: 'asc' },
      });

      for (const o of orgs) {
        results.push({
          id: o.id,
          entityType: 'ORGANIZATION',
          name: o.name,
          email: o.email ?? null,
          phone: o.phone ?? null,
          isAlreadyActivated: activatedSet.has(`ORGANIZATION:${o.id}`),
        });
      }
    }

    if (!entityType || entityType === 'LEDGER') {
      const where = {
        tenantId,
        ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
      };

      const ledgers = await (workingClient as any).ledgerMaster.findMany({
        where,
        take: limit,
        skip,
        orderBy: { name: 'asc' },
      });

      for (const l of ledgers) {
        results.push({
          id: l.id,
          entityType: 'LEDGER',
          name: l.name,
          email: (l as any).email ?? null,
          phone: null,
          isAlreadyActivated: activatedSet.has(`LEDGER:${l.id}`),
        });
      }
    }

    return paginate(results, results.length, page, limit);
  }
}
