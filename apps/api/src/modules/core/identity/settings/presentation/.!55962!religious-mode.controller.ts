import { Controller, Get, Patch, Post, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReligiousModeService } from '../services/religious-mode.service';
import { ReligiousModeConfig } from '../data/religious-presets';

@ApiTags('Settings - Religious Mode')
@Controller('settings/religious-mode')
export class ReligiousModeController {
  constructor(private readonly service: ReligiousModeService) {}

