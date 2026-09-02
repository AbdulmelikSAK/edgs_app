"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const ExcelJS = __importStar(require("exceljs"));
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
    async exportExcel(res) {
        const missions = await this.missionsService.findAll();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Chantiers EDGS');
        worksheet.addRow(['SASU EDGS']);
        worksheet.addRow(['Liste et métrés des chantiers']);
        worksheet.addRow([]);
        worksheet.getRow(1).font = { bold: true, size: 14 };
        worksheet.getRow(2).font = { italic: true, size: 11 };
        const headerRow = worksheet.addRow(['Année', 'Chantier', 'Nom du client', 'Type de prestation', 'Métré prévu', 'Métré réalisé', 'Unité']);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEFEFEF' }
        };
        missions.forEach(m => {
            const year = m.scheduledDate ? new Date(m.scheduledDate).getFullYear() : new Date().getFullYear();
            worksheet.addRow([
                year,
                m.title,
                m.client ? m.client.name : m.clientName || 'Inconnu',
                m.type || 'Sablage',
                m.surfaceArea || 0,
                m.actualQuantity !== null && m.actualQuantity !== undefined ? m.actualQuantity : '--',
                m.actualUnit || m.estimatedUnit || 'm²'
            ]);
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Chantiers_EDGS.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    }
    findToday(employeeId) {
        return this.missionsService.findTodayMissions(employeeId);
    }
    findByEmployee(employeeId) {
        return this.missionsService.findEmployeeMissions(employeeId);
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
    (0, common_1.Get)('export-excel'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.Get)('today'),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: true }),
    __param(0, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MissionsController.prototype, "findToday", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MissionsController.prototype, "findByEmployee", null);
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