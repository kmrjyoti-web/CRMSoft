export class UpdateStateCommand {
  constructor(
    public readonly stateId: string,
    public readonly data: {
      name?: string;
      category?: string;
      color?: string;
      icon?: string;
      sortOrder?: number;
      metadata?: any;
      isActive?: boolean;
    },
  ) {}
}
