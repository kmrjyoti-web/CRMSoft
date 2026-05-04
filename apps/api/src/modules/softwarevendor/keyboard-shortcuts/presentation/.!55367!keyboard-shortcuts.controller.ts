import {
  Controller, Get, Put, Delete, Post, Param, Body,
} from '@nestjs/common';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { UpsertOverrideDto, CreateCustomShortcutDto, CheckConflictDto } from './dto/shortcut.dto';

@Controller('keyboard-shortcuts')
export class KeyboardShortcutsController {
  constructor(private readonly service: KeyboardShortcutsService) {}

