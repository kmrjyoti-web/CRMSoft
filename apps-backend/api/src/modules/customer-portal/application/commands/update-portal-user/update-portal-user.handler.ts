import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { UpdatePortalUserCommand } from './update-portal-user.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';

@CommandHandler(UpdatePortalUserCommand)
export class UpdatePortalUserHandler implements ICommandHandler<UpdatePortalUserCommand> {
    private readonly logger = new Logger(UpdatePortalUserHandler.name);

  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
  ) {}

  async execute(command: UpdatePortalUserCommand) {
    try {
      const { customerUserId, menuCategoryId, pageOverrides, isActive } = command;

      const user = await this.userRepo.findById(customerUserId);
      if (!user) throw new NotFoundException('Portal user not found');

      if (menuCategoryId !== undefined) user.updateMenuCategory(menuCategoryId);
      if (pageOverrides !== undefined) user.updatePageOverrides(pageOverrides);
      if (isActive !== undefined) {
        isActive ? user.activate() : user.deactivate();
      }

      await this.userRepo.update(user);
      return { id: user.id, message: 'Portal user updated' };
    } catch (error) {
      this.logger.error(`UpdatePortalUserHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
