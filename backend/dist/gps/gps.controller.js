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
exports.GpsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const gps_service_1 = require("./gps.service");
const create_gps_point_dto_1 = require("./dto/create-gps-point.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let GpsController = class GpsController {
    gpsService;
    constructor(gpsService) {
        this.gpsService = gpsService;
    }
    track(dto) {
        return this.gpsService.track(dto);
    }
    syncBatch(points) {
        return this.gpsService.syncBatch(points);
    }
    getLivePositions() {
        return this.gpsService.getLivePositions();
    }
    getHistory(truckId, from, to) {
        return this.gpsService.getHistory(truckId, from, to);
    }
};
exports.GpsController = GpsController;
__decorate([
    (0, common_1.Post)('track'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_gps_point_dto_1.CreateGpsPointDto]),
    __metadata("design:returntype", void 0)
], GpsController.prototype, "track", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], GpsController.prototype, "syncBatch", null);
__decorate([
    (0, common_1.Get)('live'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GpsController.prototype, "getLivePositions", null);
__decorate([
    (0, common_1.Get)('history/:truckId'),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false }),
    __param(0, (0, common_1.Param)('truckId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], GpsController.prototype, "getHistory", null);
exports.GpsController = GpsController = __decorate([
    (0, swagger_1.ApiTags)('gps'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('gps'),
    __metadata("design:paramtypes", [gps_service_1.GpsService])
], GpsController);
//# sourceMappingURL=gps.controller.js.map