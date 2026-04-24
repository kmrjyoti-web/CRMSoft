import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CreateProductCommand } from './create-product.command';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  private readonly logger = new Logger(CreateProductHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateProductCommand) {
    try {
      const { data, createdById } = command;

      // Auto-generate code if not provided
      let code = data.code;
      if (!code) {
        const count = await this.prisma.working.product.count();
        code = `PRD-${String(count + 1).padStart(5, '0')}`;
      }

      // Check code uniqueness
      const existing = await this.prisma.working.product.findFirst({ where: { code } });
      if (existing) {
        throw new ConflictException(`Product code "${code}" already exists`);
      }

      // Generate slug from name
      const slug = await this.generateUniqueSlug(data.name);

      // Validate parent if provided
      let parentId = data.parentId;
      let isMaster = data.isMaster ?? false;

      if (parentId) {
        const parent = await this.prisma.working.product.findUnique({
          where: { id: parentId },
        });
        if (!parent) {
          throw new NotFoundException(`Parent product "${parentId}" not found`);
        }
        isMaster = false;
      }

      if (isMaster === true) {
        parentId = undefined;
      }

      // Create product
      const product = await this.prisma.working.product.create({
        data: {
          name: data.name,
          code,
          slug,
          shortDescription: data.shortDescription,
          description: data.description,
          parentId,
          isMaster,
          image: data.image,
          brochureUrl: data.brochureUrl,
          videoUrl: data.videoUrl,
          mrp: data.mrp,
          salePrice: data.salePrice,
          purchasePrice: data.purchasePrice,
          costPrice: data.costPrice,
          taxType: data.taxType as any,
          hsnCode: data.hsnCode,
          gstRate: data.gstRate,
          cessRate: data.cessRate,
          taxInclusive: data.taxInclusive,
          primaryUnit: data.primaryUnit as any,
          secondaryUnit: data.secondaryUnit as any,
          conversionFactor: data.conversionFactor,
          minOrderQty: data.minOrderQty,
          maxOrderQty: data.maxOrderQty,
          weight: data.weight,
          packingSize: data.packingSize,
          packingUnit: data.packingUnit as any,
          packingDescription: data.packingDescription,
          barcode: data.barcode,
          batchTracking: data.batchTracking,
          licenseRequired: data.licenseRequired,
          licenseType: data.licenseType,
          licenseNumber: data.licenseNumber,
          individualSale: data.individualSale,
          isReturnable: data.isReturnable,
          warrantyMonths: data.warrantyMonths,
          shelfLifeDays: data.shelfLifeDays,
          brandId: data.brandId,
          manufacturerId: data.manufacturerId,
          tags: data.tags ?? [],
          sortOrder: data.sortOrder ?? 0,
          createdById,
        },
      });

      // Auto-create tax detail entries if gstRate provided
      if (data.gstRate != null) {
        await this.createTaxDetails(product.id, data.gstRate, data.cessRate);
      }

      this.logger.log(`Product created: ${product.id} (${product.code})`);
      return product;
    } catch (error) {
      this.logger.error(`CreateProductHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = base;
    let suffix = 1;

    while (await this.prisma.working.product.findFirst({ where: { slug } })) {
      suffix++;
      slug = `${base}-${suffix}`;
    }

    return slug;
  }

  private async createTaxDetails(
    productId: string,
    gstRate: number,
    cessRate?: number,
  ) {
    const halfRate = gstRate / 2;
    const entries = [
      { productId, taxName: 'CGST', taxRate: halfRate, description: 'Central GST' },
      { productId, taxName: 'SGST', taxRate: halfRate, description: 'State GST' },
    ];

    if (cessRate && cessRate > 0) {
      entries.push({
        productId,
        taxName: 'CESS',
        taxRate: cessRate,
        description: 'Compensation Cess',
      });
    }

    await this.prisma.working.productTaxDetail.createMany({ data: entries });
  }
}
