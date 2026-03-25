import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { RefreshCustomerTokenCommand } from './refresh-customer-token.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';

@CommandHandler(RefreshCustomerTokenCommand)
export class RefreshCustomerTokenHandler implements ICommandHandler<RefreshCustomerTokenCommand> {
  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async execute(command: RefreshCustomerTokenCommand) {
    const user = await this.userRepo.findByRefreshToken(command.refreshToken);
    if (!user) throw new UnauthorizedException('Invalid or expired refresh token');

    if (!user.refreshTokenExp || new Date() > user.refreshTokenExp) {
      user.clearRefreshToken();
      await this.userRepo.update(user);
      throw new UnauthorizedException('Refresh token expired. Please login again.');
    }

    if (!user.isActive) throw new UnauthorizedException('Account deactivated');

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

    const newRefreshToken = uuid();
    user.setRefreshToken(newRefreshToken, 7 * 24 * 3600);
    await this.userRepo.update(user);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
