import {
  Controller, Post, Body, UseGuards, NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ReportEngineService } from '../infrastructure/report-engine.service';
import { CustomReportDto, SaveCustomReportDto } from './dto/custom-report.dto';

/**
 * Controller for the custom (ad-hoc) report builder.
 * Lets users dynamically query any entity with flexible columns,
