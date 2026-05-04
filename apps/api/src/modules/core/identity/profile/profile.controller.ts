import {
  Controller, Get, Put, Post, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { SkipTenantGuard } from '../../../../common/decorators/roles.decorator';

@ApiTags('Personal Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@SkipTenantGuard()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my personal profile' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return ApiResponse.success(await this.profileService.getMyProfile(userId), 'Profile fetched');
  }

  @Put('me')
  @ApiOperation({ summary: 'Upsert my personal profile' })
  async upsertMyProfile(@CurrentUser('id') userId: string, @Body() body: Record<string, any>) {
    return ApiResponse.success(await this.profileService.upsertMyProfile(userId, body), 'Profile updated');
  }

  @Get('me/education')
  @ApiOperation({ summary: 'List my education entries' })
  async getEducations(@CurrentUser('id') userId: string) {
    return ApiResponse.success(await this.profileService.getEducations(userId), 'Education fetched');
  }

  @Post('me/education')
  @ApiOperation({ summary: 'Add an education entry' })
  async addEducation(@CurrentUser('id') userId: string, @Body() body: Record<string, any>) {
    return ApiResponse.success(await this.profileService.addEducation(userId, body), 'Education added');
  }

  @Delete('me/education/:id')
  @ApiOperation({ summary: 'Delete an education entry' })
  async deleteEducation(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return ApiResponse.success(await this.profileService.deleteEducation(userId, id), 'Education deleted');
  }

  @Get('me/experience')
  @ApiOperation({ summary: 'List my work experience entries' })
  async getExperiences(@CurrentUser('id') userId: string) {
    return ApiResponse.success(await this.profileService.getExperiences(userId), 'Experience fetched');
  }

  @Post('me/experience')
  @ApiOperation({ summary: 'Add a work experience entry' })
  async addExperience(@CurrentUser('id') userId: string, @Body() body: Record<string, any>) {
    return ApiResponse.success(await this.profileService.addExperience(userId, body), 'Experience added');
  }

  @Delete('me/experience/:id')
  @ApiOperation({ summary: 'Delete a work experience entry' })
  async deleteExperience(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return ApiResponse.success(await this.profileService.deleteExperience(userId, id), 'Experience deleted');
  }

  @Get('me/skills')
  @ApiOperation({ summary: 'List my skills' })
  async getSkills(@CurrentUser('id') userId: string) {
    return ApiResponse.success(await this.profileService.getSkills(userId), 'Skills fetched');
  }

  @Post('me/skills')
  @ApiOperation({ summary: 'Add or update a skill' })
  async addSkill(@CurrentUser('id') userId: string, @Body() body: Record<string, any>) {
    return ApiResponse.success(await this.profileService.addSkill(userId, body), 'Skill added');
  }

  @Delete('me/skills/:id')
  @ApiOperation({ summary: 'Delete a skill' })
  async deleteSkill(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return ApiResponse.success(await this.profileService.deleteSkill(userId, id), 'Skill deleted');
  }

  @Get('me/following')
  @ApiOperation({ summary: 'List companies I follow' })
  async getFollowedCompanies(@CurrentUser('id') userId: string) {
    return ApiResponse.success(await this.profileService.getFollowedCompanies(userId), 'Followed companies fetched');
  }

  @Post('me/following/:companyId')
  @ApiOperation({ summary: 'Follow a company' })
  async followCompany(@CurrentUser('id') userId: string, @Param('companyId') companyId: string) {
    return ApiResponse.success(await this.profileService.followCompany(userId, companyId), 'Company followed');
  }

  @Delete('me/following/:companyId')
  @ApiOperation({ summary: 'Unfollow a company' })
  async unfollowCompany(@CurrentUser('id') userId: string, @Param('companyId') companyId: string) {
    return ApiResponse.success(await this.profileService.unfollowCompany(userId, companyId), 'Company unfollowed');
  }
}
