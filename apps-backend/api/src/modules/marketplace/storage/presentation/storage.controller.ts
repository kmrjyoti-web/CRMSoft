import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { R2StorageService } from '../../../../shared/infrastructure/storage/r2-storage.service';
import { PresignedUrlDto } from './dto/presigned-url.dto';

@ApiTags('Marketplace - Storage')
@ApiBearerAuth()
@Controller('marketplace/storage')
export class StorageController {
  constructor(private readonly storageService: R2StorageService) {}

  @Post('presigned-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a presigned upload URL for direct R2 upload' })
  async getPresignedUrl(
    @Body() dto: PresignedUrlDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    // Sanitize filename
    const sanitized = dto.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = this.storageService.generateKey(dto.entityType, dto.entityId, sanitized);

    const url = await this.storageService.getPresignedUploadUrl(
      key,
      dto.contentType,
      dto.expiresIn ?? 3600,
    );

    return ApiResponse.success({ url, key }, 'Presigned URL generated');
  }
}
