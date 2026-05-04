import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { UpdateDefinitionDto } from './dto/shortcut.dto';

@Controller('keyboard-shortcuts/admin')
export class KeyboardShortcutsAdminController {
  constructor(private readonly service: KeyboardShortcutsService) {}

