import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../core/prisma/prisma.module';
import { KeyboardShortcutsController } from './presentation/keyboard-shortcuts.controller';
import { KeyboardShortcutsAdminController } from './presentation/keyboard-shortcuts-admin.controller';
import { KeyboardShortcutsService } from './services/keyboard-shortcuts.service';

@Module({
  imports: [PrismaModule],
  controllers: [KeyboardShortcutsController, KeyboardShortcutsAdminController],
  providers: [KeyboardShortcutsService],
  exports: [KeyboardShortcutsService],
})
export class KeyboardShortcutsModule {}
