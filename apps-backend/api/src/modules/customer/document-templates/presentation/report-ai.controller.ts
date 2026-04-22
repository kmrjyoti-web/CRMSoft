import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { ApiResponse } from '../../../../common/utils/api-response';
import { AiReportDesignerService } from '../services/ai-report-designer.service';
import { IsString, IsOptional } from 'class-validator';

class DesignReportDto {
  @IsString() description: string;
  @IsString() documentType: string;
}

class GenerateFormulaDto {
  @IsString() description: string;
}

class FromImageDto {
  @IsString() imageDescription: string;
  @IsString() documentType: string;
}

class RefineDesignDto {
  currentDesign: Record<string, any>;
  @IsString() instruction: string;
}

@ApiTags('Report AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('report-ai')
export class ReportAiController {
  constructor(private readonly aiService: AiReportDesignerService) {}

  @Post('design-report')
  @ApiOperation({ summary: 'AI: Generate canvas layout from description' })
  async designReport(@Body() dto: DesignReportDto) {
    const design = await this.aiService.designReport(dto.description, dto.documentType);
    return ApiResponse.success(design, 'Design generated');
  }

  @Post('generate-formula')
  @ApiOperation({ summary: 'AI: Generate formula from description' })
  async generateFormula(@Body() dto: GenerateFormulaDto) {
    const formula = await this.aiService.generateFormula(dto.description);
    return ApiResponse.success(formula, 'Formula generated');
  }

  @Post('from-image')
  @ApiOperation({ summary: 'AI: Generate canvas layout from image' })
  async fromImage(@Body() dto: FromImageDto) {
    const result = await this.aiService.fromImage(dto.imageDescription, dto.documentType);
    return ApiResponse.success(result, 'Design generated from image');
  }

  @Post('refine')
  @ApiOperation({ summary: 'AI: Refine existing canvas design' })
  async refine(@Body() dto: RefineDesignDto) {
    const design = await this.aiService.refineDesign(dto.currentDesign, dto.instruction);
    return ApiResponse.success(design, 'Design refined');
  }
}
