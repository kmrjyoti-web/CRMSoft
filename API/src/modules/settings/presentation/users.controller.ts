import {
  Controller, Post, Delete, Param,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SoftDeleteUserCommand } from '../application/commands/soft-delete-user/soft-delete-user.command';
import { RestoreUserCommand } from '../application/commands/restore-user/restore-user.command';
import { PermanentDeleteUserCommand } from '../application/commands/permanent-delete-user/permanent-delete-user.command';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(':id/soft-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete user (mark as deleted, recoverable)' })
  async softDelete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new SoftDeleteUserCommand(id, userId));
    return ApiResponse.success({ id, isDeleted: true }, 'User soft-deleted');
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted user' })
  async restore(@Param('id') id: string) {
    await this.commandBus.execute(new RestoreUserCommand(id));
    return ApiResponse.success({ id, isDeleted: false }, 'User restored');
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete a soft-deleted user (irreversible)' })
  async permanentDelete(@Param('id') id: string) {
    await this.commandBus.execute(new PermanentDeleteUserCommand(id));
    return ApiResponse.success({ id, deleted: true }, 'User permanently deleted');
  }
}
