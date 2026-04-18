"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackEventDto = exports.AnalyticsSourceEnum = exports.AnalyticsEventTypeEnum = exports.AnalyticsEntityTypeEnum = void 0;
const class_validator_1 = require("class-validator");
var AnalyticsEntityTypeEnum;
(function (AnalyticsEntityTypeEnum) {
    AnalyticsEntityTypeEnum["POST"] = "POST";
    AnalyticsEntityTypeEnum["LISTING"] = "LISTING";
    AnalyticsEntityTypeEnum["OFFER"] = "OFFER";
})(AnalyticsEntityTypeEnum || (exports.AnalyticsEntityTypeEnum = AnalyticsEntityTypeEnum = {}));
var AnalyticsEventTypeEnum;
(function (AnalyticsEventTypeEnum) {
    AnalyticsEventTypeEnum["IMPRESSION"] = "IMPRESSION";
    AnalyticsEventTypeEnum["CLICK"] = "CLICK";
    AnalyticsEventTypeEnum["ENQUIRY"] = "ENQUIRY";
    AnalyticsEventTypeEnum["LEAD"] = "LEAD";
    AnalyticsEventTypeEnum["CUSTOMER"] = "CUSTOMER";
    AnalyticsEventTypeEnum["ORDER"] = "ORDER";
    AnalyticsEventTypeEnum["SHARE"] = "SHARE";
    AnalyticsEventTypeEnum["SAVE"] = "SAVE";
})(AnalyticsEventTypeEnum || (exports.AnalyticsEventTypeEnum = AnalyticsEventTypeEnum = {}));
var AnalyticsSourceEnum;
(function (AnalyticsSourceEnum) {
    AnalyticsSourceEnum["FEED"] = "FEED";
    AnalyticsSourceEnum["SEARCH"] = "SEARCH";
    AnalyticsSourceEnum["SHARE_LINK"] = "SHARE_LINK";
    AnalyticsSourceEnum["DIRECT"] = "DIRECT";
    AnalyticsSourceEnum["NOTIFICATION"] = "NOTIFICATION";
    AnalyticsSourceEnum["QR_CODE"] = "QR_CODE";
    AnalyticsSourceEnum["EXTERNAL"] = "EXTERNAL";
})(AnalyticsSourceEnum || (exports.AnalyticsSourceEnum = AnalyticsSourceEnum = {}));
class TrackEventDto {
}
exports.TrackEventDto = TrackEventDto;
__decorate([
    (0, class_validator_1.IsEnum)(AnalyticsEntityTypeEnum),
    __metadata("design:type", String)
], TrackEventDto.prototype, "entityType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackEventDto.prototype, "entityId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AnalyticsEventTypeEnum),
    __metadata("design:type", String)
], TrackEventDto.prototype, "eventType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AnalyticsSourceEnum),
    __metadata("design:type", String)
], TrackEventDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackEventDto.prototype, "deviceType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackEventDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackEventDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackEventDto.prototype, "pincode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrackEventDto.prototype, "orderValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TrackEventDto.prototype, "metadata", void 0);
//# sourceMappingURL=track-event.dto.js.map