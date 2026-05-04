import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, UnauthorizedException, Inject, NotFoundException, Logger } from '@nestjs/common';
import { ChangeCustomerPasswordCommand } from './change-customer-password.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';
import { isErr } from '@/common/types';

@CommandHandler(ChangeCustomerPasswordCommand)
export class ChangeCustomerPasswordHandler
  implements ICommandHandler<ChangeCustomerPasswordCommand>
{
    private readonly logger = new Logger(ChangeCustomerPasswordHandler.name);

  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
  ) {}

  async execute(command: ChangeCustomerPasswordCommand) {
    try {
      const { customerId, currentPassword, newPassword } = command;

      const user = await this.userRepo.findById(customerId);
      if (!user) throw new NotFoundException('Customer account not found');

      const valid = await user.validatePassword(currentPassword);
      if (!valid) throw new UnauthorizedException('Current password is incorrect');

      const result = await user.resetPassword(newPassword);
      if (isErr(result)) throw new BadRequestException(result.error.message);

      await this.userRepo.update(user);
      return { message: 'Password changed successfully' };
    } catch (error) {
      this.logger.error(`ChangeCustomerPasswordHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
