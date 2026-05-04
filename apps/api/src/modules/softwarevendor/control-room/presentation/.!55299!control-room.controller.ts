import {
  Controller, Get, Patch, Delete, Param, Body, Query, UseGuards, Req, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ControlRoomService } from '../services/control-room.service';
import { RuleResolverService } from '../services/rule-resolver.service';
import { UpdateRuleDto, ResetRuleDto, RuleQueryDto, AuditQueryDto } from './dto/control-room.dto';

@ApiTags('Control Room')
@ApiBearerAuth()
@Controller('control-room')
@UseGuards(AuthGuard('jwt'))
export class ControlRoomController {
  constructor(
    private readonly controlRoomService: ControlRoomService,
    private readonly ruleResolver: RuleResolverService,
  ) {}

  /**
