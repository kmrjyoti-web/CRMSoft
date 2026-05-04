import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { DeactivatePortalCommand } from './deactivate-portal.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';

@CommandHandler(DeactivatePortalCommand)
export class DeactivatePortalHandler implements ICommandHandler<DeactivatePortalCommand> {
    private readonly logger = new Logger(DeactivatePortalHandler.name);

  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
  ) {}

  async execute(command: DeactivatePortalCommand) {
    try {
      const { tenantId, customerUserId } = command;
      const user = await this.userRepo.findById(customerUserId);

      if (!user) throw new NotFoundException('Portal user not found');
      if (user.tenantId !== tenantId) throw new ForbiddenException('Access denied');

      user.deactivate();
      await this.userRepo.update(user);

      return { message: 'Portal access deactivated' };
    } catch (error) {
      this.logger.error(`DeactivatePortalHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
