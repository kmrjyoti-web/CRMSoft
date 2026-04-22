import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { AiPredictDto, AiGenerateDto } from './dto/ai-generate.dto';
import { GetPredictionMatrixQuery } from '../application/queries/get-prediction-matrix/get-prediction-matrix.query';
import { AiGenerateQuotationCommand } from '../application/commands/ai-generate-quotation/ai-generate-quotation.command';
import { QuotationPredictionService } from '../services/quotation-prediction.service';

@Controller('quotation-ai')
@UseGuards(AuthGuard('jwt'))
export class QuotationAiController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prediction: QuotationPredictionService,
  ) {}

  @Post('predict')
  @RequirePermissions('quotations:read')
  async predict(@Body() dto: AiPredictDto) {
    const result = await this.queryBus.execute(new GetPredictionMatrixQuery(dto.leadId));
    return ApiResponse.success(result, 'Prediction generated');
  }

  @Post('generate')
  @RequirePermissions('quotations:create')
  async generate(@Body() dto: AiGenerateDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new AiGenerateQuotationCommand(
      dto.leadId, user.id, `${user.firstName} ${user.lastName}`, dto.answers, dto.templateId,
    ));
    return ApiResponse.success(result, 'AI quotation generated');
  }

  @Get('questions/:leadId')
  @RequirePermissions('quotations:read')
  async getQuestions(@Param('leadId') leadId: string) {
    const result = await this.prediction.getQuestions(leadId);
    return ApiResponse.success(result);
  }
}
