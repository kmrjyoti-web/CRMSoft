import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { ResetCustomerPasswordCommand } from './reset-customer-password.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';
import { isErr } from '@/common/types';

@CommandHandler(ResetCustomerPasswordCommand)
export class ResetCustomerPasswordHandler
  implements ICommandHandler<ResetCustomerPasswordCommand>
{
  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
  ) {}

  async execute(command: ResetCustomerPasswordCommand) {
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
  }
}
