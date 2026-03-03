import { StorageProvider } from '@prisma/client';

export class DisconnectCloudCommand {
  constructor(
    public readonly userId: string,
    public readonly provider: StorageProvider,
  ) {}
}
