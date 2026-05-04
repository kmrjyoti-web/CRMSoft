export class MarkReadCommand {
  constructor(
    public readonly emailId: string,
    public readonly isRead: boolean,
  ) {}
}
