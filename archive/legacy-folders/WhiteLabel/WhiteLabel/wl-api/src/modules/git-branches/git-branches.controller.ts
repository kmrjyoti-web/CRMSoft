import { Controller, Post, Get, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GitBranchesService } from './git-branches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { BranchType, BranchScope } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

class CreateBranchDto {
  @IsString() partnerId: string;
  @IsOptional() @IsEnum(BranchType) branchType?: BranchType;
  @IsOptional() @IsString() parentBranch?: string;
  @IsOptional() @IsString() suffix?: string;
}

class UpdateScopeDto {
  @IsEnum(BranchScope) allowedScope: BranchScope;
  @IsOptional() @IsArray() restrictedModules?: string[];
}

@ApiTags('git-branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('git-branches')
export class GitBranchesController {
  constructor(private gitBranchesService: GitBranchesService) {}

  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.gitBranchesService.createBranch(dto);
  }

  @Get(':partnerId')
  list(@Param('partnerId') partnerId: string) {
    return this.gitBranchesService.listBranches(partnerId);
  }

  @Get(':branchId/status')
  getStatus(@Param('branchId') branchId: string) {
    return this.gitBranchesService.getBranchStatus(branchId);
  }

  @Post(':branchId/merge-upstream')
  mergeUpstream(@Param('branchId') branchId: string) {
    return this.gitBranchesService.mergeUpstream(branchId);
  }

  @Delete(':branchId')
  deleteBranch(@Param('branchId') branchId: string) {
    return this.gitBranchesService.deleteBranch(branchId);
  }

  @Patch(':branchId/scope')
  updateScope(@Param('branchId') branchId: string, @Body() dto: UpdateScopeDto) {
    return this.gitBranchesService.updateScope(branchId, dto);
  }
}
