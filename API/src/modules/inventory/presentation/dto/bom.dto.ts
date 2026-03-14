import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// ─── Formula / Recipe DTOs ───

export class CreateBOMFormulaItemDto {
  @IsString() rawMaterialId: string;
  @IsNumber() @Min(0.001) quantity: number;
  @IsString() unit: string;
  @IsOptional() @IsNumber() @Min(0) @Max(100) wastagePercent?: number;
  @IsOptional() @IsBoolean() isCritical?: boolean;
  @IsOptional() @IsString() substituteProductId?: string;
  @IsOptional() @IsNumber() sortOrder?: number;
}

export class CreateBOMFormulaDto {
  @IsString() formulaName: string;
  @IsOptional() @IsString() formulaCode?: string;
  @IsString() finishedProductId: string;
  @IsOptional() @IsNumber() yieldQuantity?: number;
  @IsOptional() @IsString() yieldUnit?: string;
  @IsOptional() @IsNumber() prepTime?: number;
  @IsOptional() @IsNumber() cookTime?: number;
  @IsOptional() @IsString() instructions?: string;
  @IsOptional() @IsString() industryCode?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreateBOMFormulaItemDto) items: CreateBOMFormulaItemDto[];
}

export class UpdateBOMFormulaDto {
  @IsOptional() @IsString() formulaName?: string;
  @IsOptional() @IsNumber() yieldQuantity?: number;
  @IsOptional() @IsString() yieldUnit?: string;
  @IsOptional() @IsNumber() prepTime?: number;
  @IsOptional() @IsNumber() cookTime?: number;
  @IsOptional() @IsString() instructions?: string;
  @IsOptional() @IsString() industryCode?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateBOMFormulaItemDto) items?: CreateBOMFormulaItemDto[];
}

// ─── Stock Check ───

export class CheckStockDto {
  @IsNumber() @Min(1) quantity: number;
  @IsString() locationId: string;
}

// ─── Production DTOs ───

export class StartProductionDto {
  @IsString() formulaId: string;
  @IsNumber() @Min(1) quantity: number;
  @IsString() locationId: string;
  @IsOptional() @IsBoolean() forcePartial?: boolean;
}

export class CompleteProductionDto {
  @IsOptional() @IsNumber() @Min(0) actualQuantity?: number;
  @IsString() locationId: string;
  @IsOptional() @IsNumber() @Min(0) scrapQuantity?: number;
  @IsOptional() @IsString() scrapReason?: string;
}

export class CancelProductionDto {
  @IsString() reason: string;
}

// ─── Scrap DTOs ───

export class RecordScrapDto {
  @IsString() productId: string;
  @IsString() scrapType: string;
  @IsNumber() @Min(1) quantity: number;
  @IsString() reason: string;
  @IsOptional() @IsString() locationId?: string;
  @IsOptional() @IsString() bomProductionId?: string;
  @IsOptional() @IsString() serialMasterId?: string;
  @IsOptional() @IsString() batchId?: string;
  @IsOptional() @IsNumber() unitCost?: number;
  @IsOptional() @IsBoolean() isRawMaterial?: boolean;
  @IsOptional() @IsBoolean() isFinishedProduct?: boolean;
  @IsOptional() @IsString() disposalMethod?: string;
}

export class WriteOffScrapDto {
  @IsOptional() @IsString() disposalMethod?: string;
}
