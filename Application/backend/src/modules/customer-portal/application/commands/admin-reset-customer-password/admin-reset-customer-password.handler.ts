import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AdminResetCustomerPasswordCommand } from './admin-reset-customer-password.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';
import { isErr } from '@/common/types';

@CommandHandler(AdminResetCustomerPasswordCommand)
export class AdminResetCustomerPasswordHandler
  implements ICommandHandler<AdminResetCustomerPasswordCommand>
{
  private readonly logger = new Logger(AdminResetCustomerPasswordHandler.name);

  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
  ) {}

  async execute(command: AdminResetCustomerPasswordCommand) {
    const user = await this.userRepo.findById(command.customerUserId);
    if (!user) throw new NotFoundException('Portal user not found');

    const newPassword = this.generatePassword();
    const result = await user.resetPassword(newPassword);
    if (isErr(result)) throw new Error(result.error.message);

    await this.userRepo.update(user);

    // TODO: send via email + WhatsApp
    this.logger.log(`[ADMIN RESET] New password for ${user.email}: ${newPassword}`);

    return {
      email: user.email,
      newPassword,
      message: `Password reset. New credentials sent to ${user.email}`,
    };
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
    return Array.from(crypto.randomBytes(10))
      .map((b) => chars[b % chars.length])
      .join('');
  }
}
