export class LogDeploymentDto {
  environment: string; // PRODUCTION | STAGING | DEVELOPMENT
  version: string;
  gitBranch: string;
  gitCommitHash: string;
  deployedBy: string;
}
