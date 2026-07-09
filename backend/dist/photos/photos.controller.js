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
exports.PhotosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const photos_service_1 = require("./photos.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const mission_photo_entity_1 = require("../database/entities/mission-photo.entity");
let PhotosController = class PhotosController {
    photosService;
    constructor(photosService) {
        this.photosService = photosService;
    }
    uploadPhoto(missionId, file, type, employeeId, notes) {
        return this.photosService.uploadPhoto(missionId, file, type, employeeId, notes);
    }
    findByMission(missionId) {
        return this.photosService.findByMission(missionId);
    }
    remove(id) {
        return this.photosService.remove(id);
    }
};
exports.PhotosController = PhotosController;
__decorate([
    (0, common_1.Post)('mission/:missionId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                type: { type: 'string' },
                employeeId: { type: 'string' },
                notes: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('missionId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('type')),
    __param(3, (0, common_1.Body)('employeeId')),
    __param(4, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", void 0)
], PhotosController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.Get)('mission/:missionId'),
    __param(0, (0, common_1.Param)('missionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PhotosController.prototype, "findByMission", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PhotosController.prototype, "remove", null);
exports.PhotosController = PhotosController = __decorate([
    (0, swagger_1.ApiTags)('photos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('photos'),
    __metadata("design:paramtypes", [photos_service_1.PhotosService])
], PhotosController);
//# sourceMappingURL=photos.controller.js.map