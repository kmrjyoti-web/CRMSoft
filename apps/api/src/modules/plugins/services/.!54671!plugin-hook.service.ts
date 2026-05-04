import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PluginService } from './plugin.service';
import { PluginHandlerRegistry, HookPayload } from '../handlers/handler-registry';
import { EncryptionService } from '../../softwarevendor/tenant-config/services/encryption.service';
import { getErrorMessage } from '@/common/utils/error.utils';

export { HookPayload };

/**
 * Fires hook events to all enabled plugins that listen to them.
 * Delegates to registered plugin handlers for actual execution.
