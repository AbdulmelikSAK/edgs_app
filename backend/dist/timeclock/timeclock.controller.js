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
exports.TimeclockController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const timeclock_service_1 = require("./timeclock.service");
const create_time_entry_dto_1 = require("./dto/create-time-entry.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TimeclockController = class TimeclockController {
    timeclockService;
    constructor(timeclockService) {
        this.timeclockService = timeclockService;
    }
    create(dto) {
        return this.timeclockService.createEntry(dto);
    }
    syncBatch(entries) {
        return this.timeclockService.syncBatch(entries);
    }
    findAllWithFilters(employeeId, startDate, endDate, status) {
        return this.timeclockService.findAllWithFilters(employeeId, startDate, endDate, status);
    }
    findByEmployee(id, date) {
        return this.timeclockService.findByEmployee(id, date);
    }
    findByMission(id) {
        return this.timeclockService.findByMission(id);
    }
    validateBatch(body) {
        return this.timeclockService.validateBatch(body.employeeId, body.startDate, body.endDate, body.validatedBy);
    }
    validateEntry(id, body) {
        return this.timeclockService.validateEntry(id, body.status, body.validationNote, body.newTimestamp, body.validatedBy);
    }
    findFlaggedForEmployee(id) {
        return this.timeclockService.findFlaggedForEmployee(id);
    }
};
exports.TimeclockController = TimeclockController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_time_entry_dto_1.CreateTimeEntryDto]),
    __metadata("design:returntype", void 0)
], TimeclockController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], TimeclockController.prototype, "syncBatch", null);
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], TimeclockController.prototype, "findAllWithFilters", null);
__decorate([
    (0, common_1.Get)('employee/:id'),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, description: 'YYYY-MM-DD' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TimeclockController.prototype, "findByEmployee", null);
__decorate([
    (0, common_1.Get)('mission/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeclockController.prototype, "findByMission", null);
__decorate([
    (0, common_1.Post)('validate-batch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeclockController.prototype, "validateBatch", null);
__decorate([
    (0, common_1.Post)(':id/validate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimeclockController.prototype, "validateEntry", null);
__decorate([
    (0, common_1.Get)('employee/:id/flagged'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeclockController.prototype, "findFlaggedForEmployee", null);
exports.TimeclockController = TimeclockController = __decorate([
    (0, swagger_1.ApiTags)('timeclock'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('timeclock'),
    __metadata("design:paramtypes", [timeclock_service_1.TimeclockService])
], TimeclockController);
//# sourceMappingURL=timeclock.controller.js.map