import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../core/prisma/prisma.service';

interface CustomerJwtPayload {
  sub: string;
  type: string;
  tenantId: string;
  email: string;
  linkedEntityType: string;
  linkedEntityId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('No authentication token provided');

    let payload: CustomerJwtPayload;
    try {
      payload = this.jwtService.verify<CustomerJwtPayload>(token, {
        secret: this.config.get('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.type !== 'CUSTOMER') {
      throw new ForbiddenException('This endpoint is for customer portal access only');
    }

    const customerUser = await this.prisma.identity.customerUser.findFirst({
      where: { id: payload.sub, isActive: true, isDeleted: false },
      include: {
        menuCategory: { select: { id: true, name: true, enabledRoutes: true } },
      },
    });

    if (!customerUser) {
      throw new UnauthorizedException('Customer account not found or deactivated');
    }

    // Attach to request for use in controllers/handlers
    request.customerUser = customerUser;
    request.tenantId = customerUser.tenantId;
    request.user = { id: payload.sub, type: 'CUSTOMER', tenantId: customerUser.tenantId };

    return true;
  }

  private extractToken(request: { headers: { authorization?: string } }): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
