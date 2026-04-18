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
exports.OnboardingStepDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const identity_client_1 = require("@prisma/identity-client");
class OnboardingStepDto {
}
exports.OnboardingStepDto = OnboardingStepDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: identity_client_1.OnboardingStep, description: 'Onboarding step to complete' }),
    (0, class_validator_1.IsEnum)(identity_client_1.OnboardingStep),
    __metadata("design:type", String)
], OnboardingStepDto.prototype, "step", void 0);
//# sourceMappingURL=onboarding-step.dto.js.map