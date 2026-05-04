import {
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateSignatureCommand } from '../application/commands/create-signature/create-signature.command';
import { UpdateSignatureCommand } from '../application/commands/update-signature/update-signature.command';
import { DeleteSignatureCommand } from '../application/commands/delete-signature/delete-signature.command';
import { GetSignaturesQuery } from '../application/queries/get-signatures/query';
import { CreateSignatureDto, UpdateSignatureDto } from './dto/signature.dto';

@ApiTags('Email Signatures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('email-signatures')
export class EmailSignatureController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('emails:create')
  async create(@Body() dto: CreateSignatureDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new CreateSignatureCommand(dto.name, dto.bodyHtml, dto.isDefault || false, userId),
    );
    return ApiResponse.success(result, 'Signature created successfully');
  }

  @Put(':id')
  @RequirePermissions('emails:update')
  async update(@Param('id') id: string, @Body() dto: UpdateSignatureDto) {
    const result = await this.commandBus.execute(
      new UpdateSignatureCommand(id, dto.name, dto.bodyHtml, dto.isDefault),
    );
    return ApiResponse.success(result, 'Signature updated successfully');
  }

  @Delete(':id')
  @RequirePermissions('emails:delete')
  async delete(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteSignatureCommand(id));
    return ApiResponse.success(null, 'Signature deleted successfully');
  }

  @Get()
  @RequirePermissions('emails:read')
  async list(@CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(new GetSignaturesQuery(userId));
    return ApiResponse.success(result, 'Signatures retrieved');
  }
}
