import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly adminEmail: string;
  private readonly adminPasswordHash: string;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    this.adminEmail = this.config.get('ADMIN_EMAIL', 'admin@crmsoft.in');
    const raw = this.config.get<string>('ADMIN_PASSWORD');
    if (!raw) throw new Error('ADMIN_PASSWORD environment variable is required');
    this.adminPasswordHash = bcrypt.hashSync(raw, 12);
  }

  async adminLogin(email: string, password: string) {
    if (email !== this.adminEmail) throw new UnauthorizedException('Invalid credentials');
    const valid = bcrypt.compareSync(password, this.adminPasswordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwt.sign({ sub: 'master-admin', email, role: 'MASTER_ADMIN' });
    return { accessToken: token, role: 'MASTER_ADMIN', email };
  }

  async partnerLogin(email: string, password: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { email } });
    if (!partner) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, partner.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwt.sign({
      sub: partner.id,
      email: partner.email,
      role: 'PARTNER',
      partnerId: partner.id,
      partnerCode: partner.partnerCode,
    });
    return { accessToken: token, role: 'PARTNER', partnerId: partner.id, partnerCode: partner.partnerCode };
  }

  async getMe(user: any) {
    if (user.role === 'MASTER_ADMIN') return { role: 'MASTER_ADMIN', email: user.email };
    const partner = await this.prisma.whiteLabelPartner.findUnique({
      where: { id: user.partnerId },
      include: { branding: true },
    });
    if (!partner) throw new UnauthorizedException();
    const { passwordHash, ...safe } = partner;
    return safe;
  }
}
