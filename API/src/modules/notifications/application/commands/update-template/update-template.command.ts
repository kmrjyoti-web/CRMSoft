export class UpdateTemplateCommand {
  constructor(
    public readonly id: string,
    public readonly subject?: string,
    public readonly body?: string,
    public readonly channels?: string[],
    public readonly variables?: string[],
    public readonly isActive?: boolean,
  ) {}
}
