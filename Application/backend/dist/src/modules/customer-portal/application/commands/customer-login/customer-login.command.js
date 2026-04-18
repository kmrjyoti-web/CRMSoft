"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerLoginCommand = void 0;
class CustomerLoginCommand {
    constructor(email, password, tenantId, ipAddress, userAgent) {
        this.email = email;
        this.password = password;
        this.tenantId = tenantId;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
}
exports.CustomerLoginCommand = CustomerLoginCommand;
//# sourceMappingURL=customer-login.command.js.map