"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ReportEmailerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportEmailerService = void 0;
const common_1 = require("@nestjs/common");
let ReportEmailerService = ReportEmailerService_1 = class ReportEmailerService {
    constructor() {
        this.logger = new common_1.Logger(ReportEmailerService_1.name);
    }
    async sendReport(params) {
        this.logger.log(`[STUB] Sending report "${params.reportName}" (${params.format}) ` +
            `to ${params.recipients.length} recipient(s): ${params.recipients.join(', ')}`);
        this.logger.log(`[STUB] Attachment: ${params.fileName} (${(params.fileBuffer.length / 1024).toFixed(1)} KB)`);
    }
    validateRecipients(recipients) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return recipients.every(email => emailRegex.test(email));
    }
};
exports.ReportEmailerService = ReportEmailerService;
exports.ReportEmailerService = ReportEmailerService = ReportEmailerService_1 = __decorate([
    (0, common_1.Injectable)()
], ReportEmailerService);
//# sourceMappingURL=report-emailer.service.js.map