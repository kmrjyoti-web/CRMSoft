import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class AccountGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getTree(tenantId: string) {
    const groups = await this.prisma.accountGroup.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });

    const map = new Map(groups.map((g) => [g.id, { ...g, children: [] as any[] }]));
    const roots: any[] = [];

    for (const g of groups) {
      const node = map.get(g.id)!;
      if (g.parentId && map.has(g.parentId)) {
        map.get(g.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async getAll(tenantId: string) {
    return this.prisma.accountGroup.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ primaryGroup: 'asc' }, { name: 'asc' }],
    });
  }

  async getById(tenantId: string, id: string) {
    const group = await this.prisma.accountGroup.findFirst({
      where: { tenantId, id },
      include: {
        children: { where: { isActive: true } },
        ledgers: { where: { isActive: true }, select: { id: true, name: true, code: true, currentBalance: true } },
      },
    });
    if (!group) throw new NotFoundException('Account group not found');
    return group;
  }

  async create(tenantId: string, data: {
    name: string; code: string; parentId?: string; primaryGroup: string;
    nature?: string; isProhibited?: boolean;
  }) {
    const existing = await this.prisma.accountGroup.findFirst({ where: { tenantId, code: data.code } });
    if (existing) throw new BadRequestException(`Group code "${data.code}" already exists`);

    if (data.parentId) {
      const parent = await this.prisma.accountGroup.findFirst({ where: { tenantId, id: data.parentId } });
      if (!parent) throw new BadRequestException('Parent group not found');
    }

    return this.prisma.accountGroup.create({
      data: { tenantId, ...data },
    });
  }

  async update(tenantId: string, id: string, data: Partial<{ name: string; parentId: string; isProhibited: boolean; isActive: boolean }>) {
    const group = await this.prisma.accountGroup.findFirst({ where: { tenantId, id } });
    if (!group) throw new NotFoundException('Account group not found');
    return this.prisma.accountGroup.update({ where: { id }, data });
  }

  async delete(tenantId: string, id: string) {
    const group = await this.prisma.accountGroup.findFirst({
      where: { tenantId, id },
      include: { children: true, ledgers: { where: { isActive: true } } },
    });
    if (!group) throw new NotFoundException('Account group not found');
    if (group.isSystem) throw new BadRequestException('Cannot delete system groups');
    if (group.children.length > 0) throw new BadRequestException('Cannot delete group with sub-groups');
    if (group.ledgers.length > 0) throw new BadRequestException('Cannot delete group with ledgers');
    return this.prisma.accountGroup.update({ where: { id }, data: { isActive: false } });
  }
}
