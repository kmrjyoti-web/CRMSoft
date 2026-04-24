export class UpdateCommunicationCommand {
  constructor(
    public readonly communicationId: string,
    public readonly data: {
      value?: string;
      priorityType?: string;
      label?: string;
    },
  ) {}
}
