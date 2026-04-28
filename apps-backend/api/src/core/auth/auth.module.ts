import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlatformBootstrapService } from './platform-bootstrap.service';
import { TalentIdService } from './talent-id.service';
import { MappingService } from './mapping.service';
import { CompanyInviteService } from './company-invite.service';
import { CompanyInviteController, PublicInviteController } from './company-invite.controller';
import { CompanyApprovalService } from './company-approval.service';
import { CompanyApprovalController } from './company-approval.controller';
import { TenantModule } from '../../modules/core/identity/tenant/tenant.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '24h' },
      }),
    }),
    forwardRef(() => TenantModule),
  ],
  controllers: [AuthController, CompanyInviteController, PublicInviteController, CompanyApprovalController],
  providers: [AuthService, JwtStrategy, PlatformBootstrapService, TalentIdService, MappingService, CompanyInviteService, CompanyApprovalService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
  exports: [AuthService, MappingService, CompanyInviteService, CompanyApprovalService],
})
export class AuthModule {}

