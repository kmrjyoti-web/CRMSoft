export class StarEmailCommand {
  constructor(
    public readonly emailId: string,
    public readonly starred: boolean,
  ) {}
}
