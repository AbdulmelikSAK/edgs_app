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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const missions_service_1 = require("./missions.service");
const create_mission_dto_1 = require("./dto/create-mission.dto");
const update_mission_dto_1 = require("./dto/update-mission.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const mission_entity_1 = require("../database/entities/mission.entity");
let MissionsController = class MissionsController {
    missionsService;
    constructor(missionsService) {
        this.missionsService = missionsService;
    }
    create(dto) {
        return this.missionsService.create(dto);
    }
    findAll() {
        return this.missionsService.findAll();
    }
    findToday(truckId) {
        return this.missionsService.findTodayMissions(truckId);
    }
    findByTruck(truckId) {
        return this.missionsService.findByTruck(truckId);
    }
    findOne(id) {
        return this.missionsService.findOne(id);
    }
    update(id, dto) {
        return this.missionsService.update(id, dto);
    }
    updateStatus(id, status) {
        return this.missionsService.updateStatus(id, status);
    }
    remove(id) {
        return this.missionsService.remove(id);
    }
};
exports.MissionsController = MissionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mission_dto_1.CreateMissionDto]),
    __metadata("design:returntype", void 0)
], MissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('today'),
    (0, swagger_1.ApiQuery)({ name: 'truckId', required: true }),
    __param(0, (0, common_1.Query)('truckId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MissionsController.prototype, "findToday", null);
__decorate([
    (0, common_1.Get)('truck/:truckId'),
    __param(0, (0, common_1.Param)('truckId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MissionsController.prototype, "findByTruck", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MissionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_mission_dto_1.UpdateMissionDto]),
    __metadata("design:returntype", void 0)
], MissionsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status/:status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MissionsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MissionsController.prototype, "remove", null);
exports.MissionsController = MissionsController = __decorate([
    (0, swagger_1.ApiTags)('missions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('missions'),
    __metadata("design:paramtypes", [missions_service_1.MissionsService])
], MissionsController);
//# sourceMappingURL=missions.controller.js.map