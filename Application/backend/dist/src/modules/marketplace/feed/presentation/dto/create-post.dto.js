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
exports.CreatePostDto = exports.VisibilityEnum = exports.PostTypeEnum = void 0;
const class_validator_1 = require("class-validator");
var PostTypeEnum;
(function (PostTypeEnum) {
    PostTypeEnum["TEXT"] = "TEXT";
    PostTypeEnum["IMAGE"] = "IMAGE";
    PostTypeEnum["VIDEO"] = "VIDEO";
    PostTypeEnum["PRODUCT_SHARE"] = "PRODUCT_SHARE";
    PostTypeEnum["CUSTOMER_FEEDBACK"] = "CUSTOMER_FEEDBACK";
    PostTypeEnum["PRODUCT_LAUNCH"] = "PRODUCT_LAUNCH";
    PostTypeEnum["POLL"] = "POLL";
    PostTypeEnum["ANNOUNCEMENT"] = "ANNOUNCEMENT";
})(PostTypeEnum || (exports.PostTypeEnum = PostTypeEnum = {}));
var VisibilityEnum;
(function (VisibilityEnum) {
    VisibilityEnum["PUBLIC"] = "PUBLIC";
    VisibilityEnum["GEO_TARGETED"] = "GEO_TARGETED";
    VisibilityEnum["VERIFIED_ONLY"] = "VERIFIED_ONLY";
    VisibilityEnum["MY_CONTACTS"] = "MY_CONTACTS";
    VisibilityEnum["SELECTED_CONTACTS"] = "SELECTED_CONTACTS";
    VisibilityEnum["CATEGORY_BASED"] = "CATEGORY_BASED";
    VisibilityEnum["GRADE_BASED"] = "GRADE_BASED";
})(VisibilityEnum || (exports.VisibilityEnum = VisibilityEnum = {}));
class CreatePostDto {
}
exports.CreatePostDto = CreatePostDto;
__decorate([
    (0, class_validator_1.IsEnum)(PostTypeEnum),
    __metadata("design:type", String)
], CreatePostDto.prototype, "postType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreatePostDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "mediaUrls", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "linkedListingId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "linkedOfferId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreatePostDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(VisibilityEnum),
    __metadata("design:type", String)
], CreatePostDto.prototype, "visibility", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "visibilityConfig", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "publishAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "hashtags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "mentions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "pollConfig", void 0);
//# sourceMappingURL=create-post.dto.js.map