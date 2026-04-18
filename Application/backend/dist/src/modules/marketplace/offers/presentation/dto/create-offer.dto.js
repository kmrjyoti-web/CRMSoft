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
exports.CreateOfferDto = exports.DiscountTypeEnum = exports.OfferTypeEnum = void 0;
const class_validator_1 = require("class-validator");
var OfferTypeEnum;
(function (OfferTypeEnum) {
    OfferTypeEnum["ONE_TIME"] = "ONE_TIME";
    OfferTypeEnum["DAILY_RECURRING"] = "DAILY_RECURRING";
    OfferTypeEnum["WEEKLY_RECURRING"] = "WEEKLY_RECURRING";
    OfferTypeEnum["FIRST_N_ORDERS"] = "FIRST_N_ORDERS";
    OfferTypeEnum["LAUNCH"] = "LAUNCH";
    OfferTypeEnum["CUSTOM"] = "CUSTOM";
})(OfferTypeEnum || (exports.OfferTypeEnum = OfferTypeEnum = {}));
var DiscountTypeEnum;
(function (DiscountTypeEnum) {
    DiscountTypeEnum["PERCENTAGE"] = "PERCENTAGE";
    DiscountTypeEnum["FLAT_AMOUNT"] = "FLAT_AMOUNT";
    DiscountTypeEnum["FREE_SHIPPING"] = "FREE_SHIPPING";
    DiscountTypeEnum["BUY_X_GET_Y"] = "BUY_X_GET_Y";
    DiscountTypeEnum["BUNDLE_PRICE"] = "BUNDLE_PRICE";
})(DiscountTypeEnum || (exports.DiscountTypeEnum = DiscountTypeEnum = {}));
class CreateOfferDto {
}
exports.CreateOfferDto = CreateOfferDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateOfferDto.prototype, "mediaUrls", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(OfferTypeEnum),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "offerType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(DiscountTypeEnum),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "discountType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "discountValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateOfferDto.prototype, "linkedListingIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateOfferDto.prototype, "linkedCategoryIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "primaryListingId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateOfferDto.prototype, "conditions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "maxRedemptions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateOfferDto.prototype, "autoCloseOnLimit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "resetTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "publishAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "expiresAt", void 0);
//# sourceMappingURL=create-offer.dto.js.map