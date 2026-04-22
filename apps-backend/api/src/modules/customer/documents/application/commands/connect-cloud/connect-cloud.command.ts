import { StorageProvider } from '@prisma/working-client';

export class ConnectCloudCommand {
  constructor(
    public readonly userId: string,
    public readonly provider: StorageProvider,
    public readonly accessToken: string,
    public readonly refreshToken?: string,
    public readonly tokenExpiry?: Date,
    public readonly accountEmail?: string,
    public readonly accountName?: string,
  ) {}
}
