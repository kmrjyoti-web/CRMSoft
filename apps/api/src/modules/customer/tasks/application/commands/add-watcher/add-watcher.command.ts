export class AddWatcherCommand {
  constructor(
    public readonly taskId: string,
    public readonly watcherUserId: string,
  ) {}
}
