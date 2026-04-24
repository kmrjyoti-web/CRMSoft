import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ForgotCustomerPasswordCommand } from './forgot-customer-password.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(ForgotCustomerPasswordCommand)
export class ForgotCustomerPasswordHandler
  implements ICommandHandler<ForgotCustomerPasswordCommand>
{
  private readonly logger = new Logger(ForgotCustomerPasswordHandler.name);

  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: ForgotCustomerPasswordCommand) {
    try {
      const { email, tenantId } = command;

      // Always return success to prevent email enumeration
      const user = await this.userRepo.findByEmail(tenantId, email);
      if (!user || !user.isActive) {
        return { message: 'If that email exists, a reset link has been sent.' };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.setPasswordResetToken(resetToken);
      await this.userRepo.update(user);

      // TODO: integrate with MailService and WaApiService when available
      // For now, log the token (replace with real delivery in production)
      this.logger.log(`[CUSTOMER PORTAL] Password reset token for ${email}: ${resetToken}`);

      return { message: 'If that email exists, a reset link has been sent.' };
    } catch (error) {
      this.logger.error(`ForgotCustomerPasswordHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
