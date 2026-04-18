import { ICommandHandler } from '@nestjs/cqrs';
import { ExtendTestEnvTtlCommand } from './extend-test-env-ttl.command';
import { ITestEnvRepository } from '../../../infrastructure/repositories/test-env.repository';
export declare class ExtendTestEnvTtlHandler implements ICommandHandler<ExtendTestEnvTtlCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestEnvRepository);
    execute(cmd: ExtendTestEnvTtlCommand): Promise<{
        expiresAt: Date;
    }>;
}
