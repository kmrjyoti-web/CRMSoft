export class WhitelistModuleDto {
  moduleCode: string;
  status?: string; // ENABLED | DISABLED | TRIAL — defaults to ENABLED
  trialExpiresAt?: string; // ISO date, required when status=TRIAL
  enabledBy?: string;
}
