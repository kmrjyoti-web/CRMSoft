import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { VersionManagerService } from './version-manager.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

@Controller('platform-console/versions')
export class VersionManagerController {
  constructor(private readonly versionManagerService: VersionManagerService) {}

  @Get('verticals')
  getVerticalVersions() {
    return this.versionManagerService.getVerticalVersions();
  }

  @Get('verticals/:type')
  getVerticalVersion(@Param('type') type: string) {
    return this.versionManagerService.getVerticalVersion(type);
  }

  @Get('rollbacks')
  getRollbacks(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.versionManagerService.getRollbacks({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get()
  getReleases(
    @Query('verticalType') verticalType?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.versionManagerService.getReleases({
      verticalType,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post()
  createRelease(@Body() dto: CreateReleaseDto) {
    return this.versionManagerService.createRelease(dto);
  }

  @Get(':id')
  getRelease(@Param('id') id: string) {
    return this.versionManagerService.getRelease(id);
  }

  @Patch(':id')
  updateRelease(@Param('id') id: string, @Body() dto: UpdateReleaseDto) {
    return this.versionManagerService.updateRelease(id, dto);
  }

  @Post(':id/publish')
  publishRelease(@Param('id') id: string, @Body() body: { publishedBy: string }) {
    return this.versionManagerService.publishRelease(id, body.publishedBy);
  }

  @Post(':id/rollback')
  rollbackRelease(@Param('id') id: string, @Body() body: { reason: string; rolledBackBy: string }) {
    return this.versionManagerService.rollbackRelease(id, body.reason, body.rolledBackBy);
  }
}
