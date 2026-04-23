import { Module } from '@nestjs/common';
import { GitBranchesService } from './git-branches.service';
import { GitBranchesController } from './git-branches.controller';

@Module({
  providers: [GitBranchesService],
  controllers: [GitBranchesController],
  exports: [GitBranchesService],
})
export class GitBranchesModule {}
