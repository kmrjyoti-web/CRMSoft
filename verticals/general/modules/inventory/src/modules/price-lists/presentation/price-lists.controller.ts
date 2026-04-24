// @ts-nocheck
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';
import { PriceListQueryDto } from './dto/price-list-query.dto';
import { AddPriceListItemDto } from './dto/add-price-list-item.dto';
import { UpdatePriceListItemDto } from './dto/update-price-list-item.dto';
import { CreatePriceListCommand } from '../application/commands/create-price-list/create-price-list.command';
import { UpdatePriceListCommand } from '../application/commands/update-price-list/update-price-list.command';
import { DeletePriceListCommand } from '../application/commands/delete-price-list/delete-price-list.command';
import { AddPriceListItemCommand } from '../application/commands/add-price-list-item/add-price-list-item.command';
import { UpdatePriceListItemCommand } from '../application/commands/update-price-list-item/update-price-list-item.command';
import { RemovePriceListItemCommand } from '../application/commands/remove-price-list-item/remove-price-list-item.command';
import { ListPriceListsQuery } from '../application/queries/list-price-lists/list-price-lists.query';
import { GetPriceListQuery } from '../application/queries/get-price-list/get-price-list.query';

@Controller('price-lists')
export class PriceListsController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  @RequirePermissions('price-lists:read')
  async list(@Query() query: PriceListQueryDto) {
    const result = await this.queryBus.execute(
      new ListPriceListsQuery(query.page, query.limit, query.search, query.isActive),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('price-lists:read')
  async getById(@Param('id') id: string) {
    return ApiResponse.success(await this.queryBus.execute(new GetPriceListQuery(id)));
  }

  @Post()
  @RequirePermissions('price-lists:create')
  async create(@Body() dto: CreatePriceListDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CreatePriceListCommand(dto, userId));
    return ApiResponse.success(result, 'Price list created');
  }

  @Patch(':id')
  @RequirePermissions('price-lists:update')
  async update(@Param('id') id: string, @Body() dto: UpdatePriceListDto) {
    return ApiResponse.success(await this.commandBus.execute(new UpdatePriceListCommand(id, dto)));
  }

  @Delete(':id')
  @RequirePermissions('price-lists:delete')
  async remove(@Param('id') id: string) {
    return ApiResponse.success(await this.commandBus.execute(new DeletePriceListCommand(id)));
  }

  @Post(':id/items')
  @RequirePermissions('price-lists:update')
  async addItem(@Param('id') priceListId: string, @Body() dto: AddPriceListItemDto) {
    const result = await this.commandBus.execute(new AddPriceListItemCommand(priceListId, dto));
    return ApiResponse.success(result, 'Item added');
  }

  @Patch(':id/items/:itemId')
  @RequirePermissions('price-lists:update')
  async updateItem(@Param('itemId') itemId: string, @Body() dto: UpdatePriceListItemDto) {
    return ApiResponse.success(await this.commandBus.execute(new UpdatePriceListItemCommand(itemId, dto)));
  }

  @Delete(':id/items/:itemId')
  @RequirePermissions('price-lists:update')
  async removeItem(@Param('itemId') itemId: string) {
    return ApiResponse.success(await this.commandBus.execute(new RemovePriceListItemCommand(itemId)));
  }
}
