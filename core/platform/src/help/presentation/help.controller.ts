import {
  Controller, Get, Post, Put, Body, Param, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../shared/api-response';
import { HelpService } from '../services/help.service';
import {
  ListHelpArticlesQueryDto,
  ContextualHelpQueryDto,
  CreateHelpArticleDto,
  UpdateHelpArticleDto,
} from './dto/help.dto';

@ApiTags('Help')
@ApiBearerAuth()
@Controller('help')
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Get('articles')
  @ApiOperation({ summary: 'List help articles (filtered, paginated)' })
  async listArticles(@Query() query: ListHelpArticlesQueryDto) {
    const result = await this.helpService.listArticles(query);
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('articles/contextual')
  @ApiOperation({ summary: 'Get contextual help for a screen/field' })
  async getContextual(@Query() query: ContextualHelpQueryDto) {
    const articles = await this.helpService.getContextual(
      query.moduleCode,
      query.screenCode,
      query.fieldCode,
    );
    return ApiResponse.success(articles);
  }

  @Get('articles/:code')
  @ApiOperation({ summary: 'Get a help article by code' })
  async getByCode(@Param('code') code: string) {
    const article = await this.helpService.getByCode(code);
    return ApiResponse.success(article);
  }

  @Post('articles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a help article (admin)' })
  async create(@Body() dto: CreateHelpArticleDto) {
    const article = await this.helpService.create(dto);
    return ApiResponse.success(article, 'Help article created');
  }

  @Put('articles/:id')
  @ApiOperation({ summary: 'Update a help article (admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHelpArticleDto,
  ) {
    const article = await this.helpService.update(id, dto);
    return ApiResponse.success(article, 'Help article updated');
  }

  @Post('articles/:id/helpful')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark article as helpful' })
  async markHelpful(@Param('id') id: string) {
    const article = await this.helpService.markHelpful(id);
    return ApiResponse.success(article, 'Marked as helpful');
  }

  @Post('articles/:id/not-helpful')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark article as not helpful' })
  async markNotHelpful(@Param('id') id: string) {
    const article = await this.helpService.markNotHelpful(id);
    return ApiResponse.success(article, 'Marked as not helpful');
  }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed default help articles' })
  async seedDefaults() {
    const result = await this.helpService.seedDefaults();
    return ApiResponse.success(result, `Seeded ${result.seeded} help articles`);
  }
}
