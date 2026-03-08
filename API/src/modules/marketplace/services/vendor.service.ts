import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AppError } from '../../../common/errors/app-error';

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register a new vendor (status = PENDING).
   */
  async register(data: {
    companyName: string;
    contactEmail: string;
    gstNumber?: string;
    revenueSharePct?: number;
  }) {
    const existing = await this.prisma.marketplaceVendor.findUnique({
      where: { contactEmail: data.contactEmail },
    });
    if (existing) {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        contactEmail: 'A vendor with this email already exists',
      });
    }

    return this.prisma.marketplaceVendor.create({
      data: {
        companyName: data.companyName,
        contactEmail: data.contactEmail,
        gstNumber: data.gstNumber ?? null,
        revenueSharePct: data.revenueSharePct ?? 70,
        status: 'PENDING',
      },
    });
  }

  /**
   * Approve a pending vendor.
   */
  async approve(vendorId: string) {
    const vendor = await this.prisma.marketplaceVendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) {
      throw AppError.from('NOT_FOUND').withDetails({ entity: 'Vendor' });
    }
    if (vendor.status === 'APPROVED') {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        status: 'Vendor is already approved',
      });
    }

    return this.prisma.marketplaceVendor.update({
      where: { id: vendorId },
      data: {
        status: 'APPROVED',
        verifiedAt: new Date(),
      },
    });
  }

  /**
   * Suspend a vendor.
   */
  async suspend(vendorId: string) {
    const vendor = await this.prisma.marketplaceVendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) {
      throw AppError.from('NOT_FOUND').withDetails({ entity: 'Vendor' });
    }
    if (vendor.status === 'SUSPENDED') {
      throw AppError.from('VALIDATION_ERROR').withDetails({
        status: 'Vendor is already suspended',
      });
    }

    return this.prisma.marketplaceVendor.update({
      where: { id: vendorId },
      data: { status: 'SUSPENDED' },
    });
  }

  /**
   * List all vendors with pagination and optional status filter.
   */
  async listAll(query?: {
    page?: string;
    limit?: string;
    status?: string;
    search?: string;
  }) {
    const page = Math.max(1, +(query?.page || '1'));
    const limit = Math.min(100, Math.max(1, +(query?.limit || '20')));
    const where: any = {};

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      where.OR = [
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { contactEmail: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.marketplaceVendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { modules: true } },
        },
      }),
      this.prisma.marketplaceVendor.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get vendor by ID with module count.
   */
  async getById(id: string) {
    const vendor = await this.prisma.marketplaceVendor.findUnique({
      where: { id },
      include: {
        _count: { select: { modules: true } },
        modules: {
          select: {
            id: true,
            moduleCode: true,
            moduleName: true,
            status: true,
            installCount: true,
            avgRating: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!vendor) {
      throw AppError.from('NOT_FOUND').withDetails({ entity: 'Vendor' });
    }

    return vendor;
  }
}
