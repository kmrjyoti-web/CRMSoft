"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireFeature = void 0;
const common_1 = require("@nestjs/common");
const feature_flag_guard_1 = require("../feature-flag.guard");
const RequireFeature = (feature) => (0, common_1.SetMetadata)(feature_flag_guard_1.REQUIRE_FEATURE_KEY, feature);
exports.RequireFeature = RequireFeature;
//# sourceMappingURL=require-feature.decorator.js.map