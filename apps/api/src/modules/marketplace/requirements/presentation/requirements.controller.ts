import {
  Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PostRequirementCommand } from '../application/commands/post-requirement/post-requirement.command';
import { SubmitQuoteCommand } from '../application/commands/submit-quote/submit-quote.command';
import { AcceptQuoteCommand } from '../application/commands/accept-quote/accept-quote.command';
import { RejectQuoteCommand } from '../application/commands/reject-quote/reject-quote.command';
import { ListRequirementsQuery } from '../application/queries/list-requirements/list-requirements.query';
import { GetRequirementQuotesQuery } from '../application/queries/get-requirement-quotes/get-requirement-quotes.query';
import { PostRequirementDto } from './dto/post-requirement.dto';
import { SubmitQuoteDto } from './dto/submit-quote.dto';

@ApiTags('Marketplace - Requirements')
@ApiBearerAuth()
@Controller('marketplace/requirements')
export class RequirementsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Post a new buyer requirement' })
  async postRequirement(
    @Body() dto: PostRequirementDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const id = await this.commandBus.execute(
      new PostRequirementCommand(
        tenantId,
        userId,
        dto.title,
        dto.description,
        dto.categoryId,
        dto.quantity,
        dto.targetPrice,
        dto.currency,
        dto.deadline ? new Date(dto.deadline) : undefined,
        dto.mediaUrls,
        undefined,
        dto.keywords,
      ),
    );
    return ApiResponse.success({ id }, 'Requirement posted');
  }

  @Get()
  @ApiOperation({ summary: 'List all requirements' })
  async listRequirements(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('authorId') authorId?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.queryBus.execute(
      new ListRequirementsQuery(
        tenantId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        categoryId,
        authorId,
        search,
      ),
    );
    return ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a requirement by ID' })
  async getRequirement(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    // Reuse list query with authorId filter as a simple lookup
    const result = await this.queryBus.execute(
      new ListRequirementsQuery(tenantId, 1, 1, undefined, undefined, undefined),
    );
    const item = result.data.find((r: Record<string, unknown>) => r.id === id);
    return ApiResponse.success(item ?? null);
  }

  @Post(':id/quote')
  @ApiOperation({ summary: 'Submit a quote for a requirement' })
  async submitQuote(
    @Param('id') requirementId: string,
    @Body() dto: SubmitQuoteDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const quoteId = await this.commandBus.execute(
      new SubmitQuoteCommand(
        requirementId,
        userId,
        tenantId,
        dto.pricePerUnit,
        dto.quantity,
        dto.deliveryDays,
        dto.creditDays,
        dto.notes,
        dto.certifications,
      ),
    );
    return ApiResponse.success({ id: quoteId }, 'Quote submitted');
  }

  @Get(':id/quotes')
  @ApiOperation({ summary: 'List all quotes for a requirement' })
  async getQuotes(
    @Param('id') requirementId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetRequirementQuotesQuery(
        requirementId,
        tenantId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
      ),
    );
    return ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
  }

  @Post(':id/accept/:quoteId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept a quote' })
  async acceptQuote(
    @Param('id') requirementId: string,
    @Param('quoteId') quoteId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.commandBus.execute(
      new AcceptQuoteCommand(requirementId, quoteId, tenantId, userId),
    );
    return ApiResponse.success(result, 'Quote accepted');
  }

  @Post(':id/reject/:quoteId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a quote' })
  async rejectQuote(
    @Param('id') requirementId: string,
    @Param('quoteId') quoteId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.commandBus.execute(
      new RejectQuoteCommand(requirementId, quoteId, tenantId, userId),
    );
    return ApiResponse.success(result, 'Quote rejected');
  }
}
