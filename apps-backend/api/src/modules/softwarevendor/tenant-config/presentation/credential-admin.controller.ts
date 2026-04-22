import {
  Controller, Get, Post, Put, Param, Body, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CredentialProvider } from '@prisma/identity-client';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EncryptionService } from '../services/encryption.service';
import { CredentialSchemaService } from '../services/credential-schema.service';
import { GlobalDefaultCredentialDto } from './dto/global-default-credential.dto';
import { SuperAdminGuard } from '../../../core/identity/tenant/infrastructure/super-admin.guard';

@ApiTags('Credential Admin')
@ApiBearerAuth()
@Controller('admin/credentials')
@UseGuards(AuthGuard('jwt'), SuperAdminGuard)
export class CredentialAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly schemaService: CredentialSchemaService,
  ) {}

  @Get('defaults')
  async listDefaults() {
    const defaults = await this.prisma.globalDefaultCredential.findMany({
      orderBy: { provider: 'asc' },
    });

    const result = defaults.map((d) => {
      const decrypted = this.encryption.decrypt(d.encryptedData);
      const masked: Record<string, string> = {};
      for (const [key, val] of Object.entries(decrypted)) {
        masked[key] = this.encryption.mask(String(val));
      }
      return {
        id: d.id,
        provider: d.provider,
        status: d.status,
        description: d.description,
        isEnabled: d.isEnabled,
        maskedCredentials: masked,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    });

    return ApiResponse.success(result, 'Global defaults retrieved');
  }

  @Post('defaults')
  async createDefault(@Body() dto: GlobalDefaultCredentialDto) {
    const validation = this.schemaService.validate(dto.provider, dto.credentials);
    if (!validation.valid) {
      return ApiResponse.error(validation.errors.join('; '));
    }

    const encryptedData = this.encryption.encrypt(dto.credentials);

    const result = await this.prisma.globalDefaultCredential.upsert({
      where: { provider: dto.provider },
      create: {
        provider: dto.provider,
        encryptedData,
        description: dto.description,
        isEnabled: dto.isEnabled ?? false,
        status: 'ACTIVE',
      },
      update: {
        encryptedData,
        description: dto.description,
        isEnabled: dto.isEnabled,
      },
    });

    return ApiResponse.success({ id: result.id }, 'Global default credential saved');
  }

  @Put('defaults/:provider')
  async updateDefault(
    @Param('provider') provider: CredentialProvider,
    @Body() dto: GlobalDefaultCredentialDto,
  ) {
    const encryptedData = this.encryption.encrypt(dto.credentials);

    await this.prisma.globalDefaultCredential.update({
      where: { provider },
      data: {
        encryptedData,
        description: dto.description,
        isEnabled: dto.isEnabled,
      },
    });

    return ApiResponse.success(null, 'Global default credential updated');
  }

  @Post('rotate-key')
  async rotateKey(@Body() body: { oldKey: string; newKey: string }) {
    const result = await this.encryption.rotateEncryptionKey(body.oldKey, body.newKey);
    return ApiResponse.success(result, `${result.rotated} credentials re-encrypted`);
  }
}
