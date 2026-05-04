export class CreateReleaseDto {
  version: string;        // semver e.g. "2.4.1"
  verticalType?: string;  // null = platform-wide
  releaseType: string;    // MAJOR | MINOR | PATCH
  releaseNotes?: string;
  gitTag?: string;
  gitCommitHash?: string;
}
