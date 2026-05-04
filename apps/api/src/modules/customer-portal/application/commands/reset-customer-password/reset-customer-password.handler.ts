import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { ResetCustomerPasswordCommand } from './reset-customer-password.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';
import { isErr } from '@/common/types';

@CommandHandler(ResetCustomerPasswordCommand)
export class ResetCustomerPasswordHandler
  implements ICommandHandler<ResetCustomerPasswordCommand>
{
    private readonly logger = new Logger(ResetCustomerPasswordHandler.name);

  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
  ) {}

  async execute(command: ResetCustomerPasswordCommand) {
    try {
      const { token, newPassword } = command;

      const user = await this.userRepo.findByPasswordResetToken(token);
      if (!user) throw new BadRequestException('Invalid or expired reset token');

      if (!user.passwordResetExp || new Date() > user.passwordResetExp) {
        throw new BadRequestException('Reset token has expired. Please request a new one.');
      }

      const result = await user.resetPassword(newPassword);
      if (isErr(result)) throw new BadRequestException(result.error.message);

      await this.userRepo.update(user);
      return { message: 'Password reset successfully. You can now log in.' };
    } catch (error) {
      this.logger.error(`ResetCustomerPasswordHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
