export class RemoveWatcherCommand {
  constructor(
    public readonly taskId: string,
    public readonly watcherUserId: string,
  ) {}
}
