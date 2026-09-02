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
exports.SiteSupervisorsController = void 0;
const common_1 = require("@nestjs/common");
const site_supervisors_service_1 = require("./site-supervisors.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SiteSupervisorsController = class SiteSupervisorsController {
    siteSupervisorsService;
    constructor(siteSupervisorsService) {
        this.siteSupervisorsService = siteSupervisorsService;
    }
    async findAll(clientId) {
        return this.siteSupervisorsService.findAll(clientId);
    }
    async findOne(id) {
        return this.siteSupervisorsService.findOne(id);
    }
    async create(body) {
        return this.siteSupervisorsService.create(body);
    }
    async update(id, body) {
        return this.siteSupervisorsService.update(id, body);
    }
    async remove(id) {
        return this.siteSupervisorsService.remove(id);
    }
};
exports.SiteSupervisorsController = SiteSupervisorsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SiteSupervisorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SiteSupervisorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SiteSupervisorsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SiteSupervisorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SiteSupervisorsController.prototype, "remove", null);
exports.SiteSupervisorsController = SiteSupervisorsController = __decorate([
    (0, common_1.Controller)('site-supervisors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [site_supervisors_service_1.SiteSupervisorsService])
], SiteSupervisorsController);
//# sourceMappingURL=site-supervisors.controller.js.map