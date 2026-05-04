import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/roles.decorator';
import { CustomerAuthGuard } from '../infrastructure/guards/customer-auth.guard';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { CustomerLoginCommand } from '../application/commands/customer-login/customer-login.command';
import { RefreshCustomerTokenCommand } from '../application/commands/refresh-customer-token/refresh-customer-token.command';
import { ForgotCustomerPasswordCommand } from '../application/commands/forgot-customer-password/forgot-customer-password.command';
import { ResetCustomerPasswordCommand } from '../application/commands/reset-customer-password/reset-customer-password.command';
import { ChangeCustomerPasswordCommand } from '../application/commands/change-customer-password/change-customer-password.command';
import { GetCustomerMenuQuery } from '../application/queries/get-customer-menu/get-customer-menu.query';
import { GetCustomerProfileQuery } from '../application/queries/get-customer-profile/get-customer-profile.query';

class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

class ForgotPasswordDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  tenantId: string;
}

class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

@ApiTags('Customer Portal — Auth')
@Controller('customer/auth')
export class CustomerAuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Customer portal login' })
  login(
    @Body() dto: CustomerLoginDto,
    @Request() req: { ip?: string; headers: { 'user-agent'?: string } },
  ) {
    return this.commandBus.execute(
      new CustomerLoginCommand(
        dto.email,
        dto.password,
        dto.tenantId,
        req.ip,
        req.headers['user-agent'],
      ),
    );
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh customer access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.commandBus.execute(new RefreshCustomerTokenCommand(dto.refreshToken));
  }

  @Post('forgot-password')
  @Public()
  @ApiOperation({ summary: 'Request password reset link' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.commandBus.execute(
      new ForgotCustomerPasswordCommand(dto.email, dto.tenantId),
    );
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.commandBus.execute(
      new ResetCustomerPasswordCommand(dto.token, dto.newPassword),
    );
  }

  @Patch('change-password')
  @Public()
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (authenticated)' })
  changePassword(
    @Request() req: { customerUser: { id: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.commandBus.execute(
      new ChangeCustomerPasswordCommand(
        req.customerUser.id,
        dto.currentPassword,
        dto.newPassword,
      ),
    );
  }

  @Get('menu')
  @Public()
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get resolved menu for current customer' })
  getMenu(@Request() req: { customerUser: { id: string } }) {
    return this.queryBus.execute(new GetCustomerMenuQuery(req.customerUser.id));
  }

  @Get('profile')
  @Public()
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my profile' })
  getProfile(@Request() req: { customerUser: { id: string } }) {
    return this.queryBus.execute(new GetCustomerProfileQuery(req.customerUser.id));
  }

  @Patch('profile')
  @Public()
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile' })
  updateProfile(
    @Request() req: { customerUser: { id: string } },
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    // Simple direct update (no separate command needed for profile patch)
    // TODO: add UpdateCustomerProfileCommand if more business logic is needed
    return { id: req.customerUser.id, ...dto, message: 'Profile updated' };
  }
}
