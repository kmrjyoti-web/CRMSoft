export class ChangeCustomerPasswordCommand {
  constructor(
    public readonly customerId: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
  ) {}
}
