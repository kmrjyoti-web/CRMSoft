import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import slugify from 'slugify';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  generateCode(companyName: string): string {
    return slugify(companyName, { lower: true, strict: true }).substring(0, 20);
  }

  async create(dto: any) {
    const partnerCode = dto.partnerCode || this.generateCode(dto.companyName);
    const existing = await this.prisma.whiteLabelPartner.findFirst({ where: { OR: [{ email: dto.email }, { partnerCode }] } });
    if (existing) throw new ConflictException('Partner with this email or code already exists');
    const passwordHash = await bcrypt.hash(dto.password || 'Partner@123', 10);
    const trialExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const partner = await this.prisma.whiteLabelPartner.create({
      data: { ...dto, partnerCode, passwordHash, trialExpiresAt, password: undefined },
      include: { branding: true, domains: true },
    });
    const { passwordHash: _, ...safe } = partner;
    return safe;
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search ? { OR: [{ companyName: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] } : {};
    const [data, total] = await Promise.all([
      this.prisma.whiteLabelPartner.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { branding: true, _count: { select: { domains: true } } } }),
      this.prisma.whiteLabelPartner.count({ where }),
    ]);
    return { data: data.map(({ passwordHash, ...p }) => p), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({
      where: { id },
      include: { branding: true, domains: true, deployment: true, gitBranches: true, featureFlags: true },
    });
    if (!partner) throw new NotFoundException('Partner not found');
    const { passwordHash, ...safe } = partner;
    return safe;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    const partner = await this.prisma.whiteLabelPartner.update({ where: { id }, data: dto, include: { branding: true } });
    const { passwordHash, ...safe } = partner;
    return safe;
  }

  async suspend(id: string, reason: string) {
    await this.findOne(id);
    const partner = await this.prisma.whiteLabelPartner.update({
      where: { id },
      data: { status: 'SUSPENDED', suspendedAt: new Date(), suspendedReason: reason },
    });
    const { passwordHash, ...safe } = partner;
    return safe;
  }

  async activate(id: string) {
    await this.findOne(id);
    const partner = await this.prisma.whiteLabelPartner.update({
      where: { id },
      data: { status: 'ACTIVE', suspendedAt: null, suspendedReason: null },
    });
    const { passwordHash, ...safe } = partner;
    return safe;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.whiteLabelPartner.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  async getDashboard() {
    const [total, active, trial, suspended, cancelled] = await Promise.all([
      this.prisma.whiteLabelPartner.count(),
      this.prisma.whiteLabelPartner.count({ where: { status: 'ACTIVE' } }),
      this.prisma.whiteLabelPartner.count({ where: { status: 'TRIAL' } }),
      this.prisma.whiteLabelPartner.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.whiteLabelPartner.count({ where: { status: 'CANCELLED' } }),
    ]);
    const recent = await this.prisma.whiteLabelPartner.findMany({
      take: 5, orderBy: { createdAt: 'desc' }, include: { branding: true },
    });
    return { stats: { total, active, trial, suspended, cancelled }, recentPartners: recent.map(({ passwordHash, ...p }) => p) };
  }
}
