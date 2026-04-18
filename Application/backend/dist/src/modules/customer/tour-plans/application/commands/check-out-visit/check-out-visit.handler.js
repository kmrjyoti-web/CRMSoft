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
var CheckOutVisitHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckOutVisitHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const check_out_visit_command_1 = require("./check-out-visit.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CheckOutVisitHandler = CheckOutVisitHandler_1 = class CheckOutVisitHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CheckOutVisitHandler_1.name);
    }
    async execute(cmd) {
        try {
            const visit = await this.prisma.working.tourPlanVisit.findUnique({ where: { id: cmd.visitId } });
            if (!visit)
                throw new common_1.NotFoundException('Visit not found');
            if (!visit.actualArrival)
                throw new common_1.BadRequestException('Must check in before checking out');
            if (visit.actualDeparture)
                throw new common_1.BadRequestException('Already checked out');
            const updated = await this.prisma.working.tourPlanVisit.update({
                where: { id: cmd.visitId },
                data: {
                    actualDeparture: new Date(),
                    checkOutLat: cmd.latitude,
                    checkOutLng: cmd.longitude,
                    checkOutPhoto: cmd.photoUrl,
                    outcome: cmd.outcome,
                    notes: cmd.notes,
                    isCompleted: true,
                },
            });
            if (cmd.photoUrl) {
                await this.prisma.working.tourPlanPhoto.create({
                    data: {
                        tourPlanVisitId: cmd.visitId,
                        photoUrl: cmd.photoUrl,
                        photoType: 'CHECK_OUT',
                        latitude: cmd.latitude,
                        longitude: cmd.longitude,
                    },
                });
            }
            return updated;
        }
        catch (error) {
            this.logger.error(`CheckOutVisitHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CheckOutVisitHandler = CheckOutVisitHandler;
exports.CheckOutVisitHandler = CheckOutVisitHandler = CheckOutVisitHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(check_out_visit_command_1.CheckOutVisitCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CheckOutVisitHandler);
//# sourceMappingURL=check-out-visit.handler.js.map