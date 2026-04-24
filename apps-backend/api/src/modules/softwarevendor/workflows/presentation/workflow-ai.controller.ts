import {
  Controller, Post, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { ApiResponse } from '../../../../common/utils/api-response';
import { WorkflowAiService } from '../services/workflow-ai.service';

class GenerateFromPromptDto {
  prompt: string;
  context?: {
    existingNodes?: number;
    workflowName?: string;
  };
}

@ApiTags('Workflows - AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflow-admin/ai')
export class WorkflowAiController {
  constructor(private readonly workflowAiService: WorkflowAiService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate workflow nodes from natural language prompt' })
  generate(@Body() dto: GenerateFromPromptDto) {
    const result = this.workflowAiService.generateFromPrompt(dto.prompt, dto.context);
    return ApiResponse.success(result, 'Workflow generated from prompt');
  }
}
