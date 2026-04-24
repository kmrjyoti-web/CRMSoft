import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DevRequestsService } from './dev-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DevRequestStatus, DevRequestType, ErrorSeverity } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';

class SubmitRequestDto {
  @IsString() partnerId: string;
  @IsEnum(DevRequestType) requestType: DevRequestType;
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(ErrorSeverity) priority?: ErrorSeverity;
}

class ReviewDto {
  @IsEnum(['APPROVE', 'REJECT']) action: 'APPROVE' | 'REJECT';
  @IsOptional() @IsNumber() estimatedHours?: number;
  @IsOptional() @IsNumber() quotedPrice?: number;
  @IsOptional() @IsString() rejectedReason?: string;
}

class AssignDto {
  @IsString() assignedDeveloper: string;
  @IsOptional() @IsString() gitBranch?: string;
}

class AcceptDto {
  @IsOptional() @IsNumber() actualHours?: number;
}

class SetDueDateDto {
  @IsDateString() dueDate: string;
  @IsOptional() @IsNumber() slaHours?: number;
}

class AddCommentDto {
  @IsString() authorRole: string;
  @IsString() authorName: string;
  @IsString() message: string;
  @IsOptional() @IsBoolean() isInternal?: boolean;
}

@ApiTags('dev-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dev-requests')
export class DevRequestsController {
  constructor(private devRequestsService: DevRequestsService) {}

  @Post()
  submit(@Body() dto: SubmitRequestDto) {
    return this.devRequestsService.submit(dto);
  }

  @Get('dashboard')
  getDashboard() {
    return this.devRequestsService.getDashboard();
  }

  @Get()
  findAll(
    @Query('partnerId') partnerId?: string,
    @Query('status') status?: DevRequestStatus,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.devRequestsService.findAll({ partnerId, status, page: +page, limit: +limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devRequestsService.findOne(id);
  }

  @Post(':id/review')
  review(@Param('id') id: string, @Body() dto: ReviewDto) {
    return this.devRequestsService.review(id, dto);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignDto) {
    return this.devRequestsService.assign(id, dto);
  }

  @Post(':id/deliver')
  deliver(@Param('id') id: string) {
    return this.devRequestsService.deliver(id);
  }

  @Post(':id/accept')
  accept(@Param('id') id: string, @Body() dto: AcceptDto) {
    return this.devRequestsService.accept(id, dto.actualHours);
  }

  @Patch(':id/due-date')
  setDueDate(@Param('id') id: string, @Body() dto: SetDueDateDto) {
    return this.devRequestsService.setDueDate(id, new Date(dto.dueDate), dto.slaHours);
  }

  @Get('overdue')
  getOverdue() {
    return this.devRequestsService.getOverdue();
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() dto: AddCommentDto) {
    return this.devRequestsService.addComment(id, dto);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string, @Query('isPartner') isPartner?: string) {
    return this.devRequestsService.getComments(id, isPartner === 'true');
  }
}
