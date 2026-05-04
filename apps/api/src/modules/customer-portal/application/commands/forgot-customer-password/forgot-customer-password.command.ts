export class ForgotCustomerPasswordCommand {
  constructor(
    public readonly email: string,
    public readonly tenantId: string,
  ) {}
}
