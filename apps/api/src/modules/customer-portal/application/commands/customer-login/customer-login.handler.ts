import {
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import {
  UnauthorizedException,
  ForbiddenException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { CustomerLoginCommand } from './customer-login.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CustomerLoginCommand)
export class CustomerLoginHandler implements ICommandHandler<CustomerLoginCommand> {
  private readonly logger = new Logger(CustomerLoginHandler.name);

  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: CustomerLoginCommand) {
    try {
      const { email, password, tenantId, ipAddress, userAgent } = command;

      const user = await this.userRepo.findByEmail(tenantId, email);

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (!user.isActive) {
        throw new ForbiddenException('Your portal account has been deactivated. Contact support.');
      }
      if (user.isLocked) {
        throw new ForbiddenException('Account temporarily locked due to too many failed attempts. Try again in 30 minutes.');
      }

      const valid = await user.validatePassword(password);
      if (!valid) {
        user.recordFailedLogin();
        await this.userRepo.update(user);
        throw new UnauthorizedException('Invalid email or password');
      }

      // Success
      user.recordSuccessfulLogin();

      const accessToken = this.jwtService.sign(
        {
          sub: user.id,
          type: 'CUSTOMER',
          tenantId: user.tenantId,
          email: user.email,
          linkedEntityType: user.linkedEntityType,
          linkedEntityId: user.linkedEntityId,
        },
        { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN', '24h') },
      );

      const refreshToken = uuid();
      user.setRefreshToken(refreshToken, 7 * 24 * 3600); // 7 days
      await this.userRepo.update(user);

      // Log the login action
      await this.prisma.identity.customerPortalLog.create({
        data: {
          tenantId,
          customerUserId: user.id,
          action: 'LOGIN',
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
          metadata: {},
        },
      });

      // Resolve menu
      let menu: string[] = [];
      if (user.menuCategoryId) {
        const category = await this.prisma.identity.customerMenuCategory.findUnique({
          where: { id: user.menuCategoryId },
        });
        if (category) {
          menu = user.resolveMenu(category.enabledRoutes as string[]);
        }
      }

      return {
        accessToken,
        refreshToken,
        isFirstLogin: user.isFirstLogin,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          companyName: user.companyName,
          avatarUrl: user.avatarUrl,
          linkedEntityType: user.linkedEntityType,
          linkedEntityId: user.linkedEntityId,
          linkedEntityName: user.linkedEntityName,
        },
        menu,
      };
    } catch (error) {
      this.logger.error(`CustomerLoginHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
