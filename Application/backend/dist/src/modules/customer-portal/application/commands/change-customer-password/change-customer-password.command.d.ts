export declare class ChangeCustomerPasswordCommand {
    readonly customerId: string;
    readonly currentPassword: string;
    readonly newPassword: string;
    constructor(customerId: string, currentPassword: string, newPassword: string);
}
