import { StorageProvider } from '@prisma/working-client';

export class DisconnectCloudCommand {
  constructor(
    public readonly userId: string,
    public readonly provider: StorageProvider,
  ) {}
}
