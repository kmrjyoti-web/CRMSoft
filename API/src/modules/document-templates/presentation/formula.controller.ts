import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { FormulaService } from '../services/formula.service';
import { IsString, IsOptional, IsArray } from 'class-validator';

class CreateFormulaDto {
  @IsString() name: string;
  @IsString() category: string;
  @IsString() expression: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() requiredFields?: string[];
  @IsOptional() @IsString() outputType?: string;
  @IsOptional() @IsString() outputFormat?: string;
}

class UpdateFormulaDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() expression?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() requiredFields?: string[];
  @IsOptional() @IsString() outputType?: string;
  @IsOptional() @IsString() outputFormat?: string;
}

class EvaluateFormulaDto {
  @IsString() expression: string;
  @IsOptional() variables?: Record<string, any>;
}

@ApiTags('Formulas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('formulas')
export class FormulaController {
  constructor(private readonly formulaService: FormulaService) {}

  @Get()
  @ApiOperation({ summary: 'List all formulas (system + tenant)' })
  async findAll(@CurrentUser() user: any, @Query('category') category?: string) {
    const tenantId = user.tenantId;
    const formulas = category
      ? await this.formulaService.findByCategory(category, tenantId)
      : await this.formulaService.findAll(tenantId);
    return ApiResponse.success(formulas);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get formula by ID' })
  async findById(@Param('id') id: string) {
    const formula = await this.formulaService.findById(id);
    return ApiResponse.success(formula);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new formula' })
  async create(@CurrentUser() user: any, @Body() dto: CreateFormulaDto) {
    const formula = await this.formulaService.create({
      ...dto,
      tenantId: user.tenantId,
    });
    return ApiResponse.success(formula, 'Formula created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a formula' })
  async update(@Param('id') id: string, @Body() dto: UpdateFormulaDto) {
    const formula = await this.formulaService.update(id, dto);
    return ApiResponse.success(formula, 'Formula updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a formula' })
  async delete(@Param('id') id: string) {
    await this.formulaService.delete(id);
    return ApiResponse.success(null, 'Formula deleted');
  }

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluate a formula expression' })
  async evaluate(@Body() dto: EvaluateFormulaDto) {
    const result = this.formulaService.evaluate(dto.expression, dto.variables ?? {});
    return ApiResponse.success({ result });
  }
}
