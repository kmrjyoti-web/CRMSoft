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
var CheckInVisitHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckInVisitHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const check_in_visit_command_1 = require("./check-in-visit.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const geo_utils_1 = require("../../../../../../common/utils/geo.utils");
let CheckInVisitHandler = CheckInVisitHandler_1 = class CheckInVisitHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CheckInVisitHandler_1.name);
    }
    async execute(cmd) {
        try {
            const visit = await this.prisma.working.tourPlanVisit.findUnique({
                where: { id: cmd.visitId },
                include: { tourPlan: true, lead: true },
            });
            if (!visit)
                throw new common_1.NotFoundException('Visit not found');
            if (visit.actualArrival)
                throw new common_1.BadRequestException('Already checked in');
            let distanceFromTarget;
            if (visit.lead) {
                const leadWithOrg = await this.prisma.working.lead.findUnique({
                    where: { id: visit.lead.id },
                    include: { organization: true },
                });
                if (leadWithOrg?.organization) {
                    const org = leadWithOrg.organization;
                    if (org.latitude && org.longitude) {
                        distanceFromTarget = (0, geo_utils_1.haversineDistance)(cmd.latitude, cmd.longitude, Number(org.latitude), Number(org.longitude));
                    }
                }
            }
            const updated = await this.prisma.working.tourPlanVisit.update({
                where: { id: cmd.visitId },
                data: {
                    actualArrival: new Date(),
                    checkInLat: cmd.latitude,
                    checkInLng: cmd.longitude,
                    checkInPhoto: cmd.photoUrl,
                    distanceFromTarget,
                },
            });
            if (cmd.photoUrl) {
                await this.prisma.working.tourPlanPhoto.create({
                    data: {
                        tourPlanVisitId: cmd.visitId,
                        photoUrl: cmd.photoUrl,
                        photoType: 'CHECK_IN',
                        latitude: cmd.latitude,
                        longitude: cmd.longitude,
                    },
                });
            }
            return updated;
        }
        catch (error) {
            this.logger.error(`CheckInVisitHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CheckInVisitHandler = CheckInVisitHandler;
exports.CheckInVisitHandler = CheckInVisitHandler = CheckInVisitHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(check_in_visit_command_1.CheckInVisitCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CheckInVisitHandler);
//# sourceMappingURL=check-in-visit.handler.js.map