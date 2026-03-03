import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { UpdateProductCommand } from './update-product.command';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
  private readonly logger = new Logger(UpdateProductHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateProductCommand) {
    const { id, data } = command;

    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Product "${id}" not found`);
    }

    const updateData: Record<string, any> = { ...data };

    // If name changes, regenerate slug
    if (data.name && data.name !== existing.name) {
      updateData.slug = await this.generateUniqueSlug(data.name, id);
    }

    // If parentId changes, prevent circular reference
    if (data.parentId !== undefined) {
      if (data.parentId === id) {
        throw new BadRequestException('Product cannot be its own parent');
      }
      if (data.parentId) {
        const isChild = await this.isDescendant(data.parentId, id);
        if (isChild) {
          throw new BadRequestException(
            'Circular reference: target parent is a child of this product',
          );
        }
      }
    }

    // Cast enum fields for Prisma
    if (updateData.taxType) updateData.taxType = updateData.taxType as any;
    if (updateData.primaryUnit) updateData.primaryUnit = updateData.primaryUnit as any;
    if (updateData.secondaryUnit) updateData.secondaryUnit = updateData.secondaryUnit as any;
    if (updateData.packingUnit) updateData.packingUnit = updateData.packingUnit as any;

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    // If gstRate changes, recreate tax details
    if (data.gstRate !== undefined) {
      await this.prisma.productTaxDetail.deleteMany({
        where: { productId: id },
      });

      if (data.gstRate != null) {
        const halfRate = data.gstRate / 2;
        const entries = [
          { productId: id, taxName: 'CGST', taxRate: halfRate, description: 'Central GST' },
          { productId: id, taxName: 'SGST', taxRate: halfRate, description: 'State GST' },
        ];
        if (data.cessRate && data.cessRate > 0) {
          entries.push({
            productId: id,
            taxName: 'CESS',
            taxRate: data.cessRate,
            description: 'Compensation Cess',
          });
        }
        await this.prisma.productTaxDetail.createMany({ data: entries });
      }
    }

    this.logger.log(`Product updated: ${product.id}`);
    return product;
  }

  private async generateUniqueSlug(name: string, excludeId: string): Promise<string> {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = base;
    let suffix = 1;

    while (true) {
      const found = await this.prisma.product.findFirst({ where: { slug } });
      if (!found || found.id === excludeId) break;
      suffix++;
      slug = `${base}-${suffix}`;
    }

    return slug;
  }

  private async isDescendant(candidateId: string, ancestorId: string): Promise<boolean> {
    const children = await this.prisma.product.findMany({
      where: { parentId: ancestorId },
      select: { id: true },
    });

    for (const child of children) {
      if (child.id === candidateId) return true;
      const found = await this.isDescendant(candidateId, child.id);
      if (found) return true;
    }

    return false;
  }
}
