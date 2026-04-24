export class GetTaskByIdQuery {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
  ) {}
}
