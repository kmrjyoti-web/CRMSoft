import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    return (this.prisma.identity as any).gvPerUserProfile.findUnique({
      where: { userId },
    });
  }

  async upsertMyProfile(userId: string, data: Record<string, any>) {
    return (this.prisma.identity as any).gvPerUserProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async getEducations(userId: string) {
    return (this.prisma.identity as any).gvPerEducation.findMany({
      where: { userId },
      orderBy: [{ endYear: 'desc' }, { startYear: 'desc' }],
    });
  }

  async addEducation(userId: string, data: Record<string, any>) {
    return (this.prisma.identity as any).gvPerEducation.create({
      data: { userId, ...data },
    });
  }

  async deleteEducation(userId: string, id: string) {
    const record = await (this.prisma.identity as any).gvPerEducation.findFirst({
      where: { id, userId },
    });
    if (!record) throw new NotFoundException('Education not found');
    return (this.prisma.identity as any).gvPerEducation.delete({ where: { id } });
  }

  async getExperiences(userId: string) {
    return (this.prisma.identity as any).gvPerExperience.findMany({
      where: { userId },
      orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
    });
  }

  async addExperience(userId: string, data: Record<string, any>) {
    return (this.prisma.identity as any).gvPerExperience.create({
      data: { userId, ...data },
    });
  }

  async deleteExperience(userId: string, id: string) {
    const record = await (this.prisma.identity as any).gvPerExperience.findFirst({
      where: { id, userId },
    });
    if (!record) throw new NotFoundException('Experience not found');
    return (this.prisma.identity as any).gvPerExperience.delete({ where: { id } });
  }

  async getSkills(userId: string) {
    return (this.prisma.identity as any).gvPerSkill.findMany({
      where: { userId },
      orderBy: [{ endorsements: 'desc' }, { name: 'asc' }],
    });
  }

  async addSkill(userId: string, data: Record<string, any>) {
    return (this.prisma.identity as any).gvPerSkill.upsert({
      where: { userId_name: { userId, name: data.name } },
      create: { userId, ...data },
      update: { proficiency: data.proficiency, yearsOfExp: data.yearsOfExp },
    });
  }

  async deleteSkill(userId: string, id: string) {
    const record = await (this.prisma.identity as any).gvPerSkill.findFirst({
      where: { id, userId },
    });
    if (!record) throw new NotFoundException('Skill not found');
    return (this.prisma.identity as any).gvPerSkill.delete({ where: { id } });
  }

  async getFollowedCompanies(userId: string) {
    return (this.prisma.identity as any).gvPerCompanyFollow.findMany({
      where: { userId },
      orderBy: { followedAt: 'desc' },
    });
  }

  async followCompany(userId: string, companyId: string) {
    return (this.prisma.identity as any).gvPerCompanyFollow.upsert({
      where: { userId_companyId: { userId, companyId } },
      create: { userId, companyId },
      update: {},
    });
  }

  async unfollowCompany(userId: string, companyId: string) {
    const record = await (this.prisma.identity as any).gvPerCompanyFollow.findFirst({
      where: { userId, companyId },
    });
    if (!record) throw new NotFoundException('Follow not found');
    return (this.prisma.identity as any).gvPerCompanyFollow.delete({ where: { id: record.id } });
  }
}
