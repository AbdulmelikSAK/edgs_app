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
exports.TimeclockController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const timeclock_service_1 = require("./timeclock.service");
const create_time_entry_dto_1 = require("./dto/create-time-entry.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const ExcelJS = __importStar(require("exceljs"));
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
    async exportExcel(res, employeeId, startDate, endDate) {
        const entries = await this.timeclockService.findAllWithFilters(employeeId, startDate, endDate);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Heures');
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const now = new Date();
        const currentMonthYear = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
        worksheet.addRow(['SASU EDGS']);
        worksheet.addRow(['61 route de Valréas, 84600 Grillon']);
        worksheet.addRow([`Récapitulatif des heures (${currentMonthYear})`]);
        worksheet.addRow([]);
        worksheet.getRow(1).font = { bold: true, size: 14 };
        worksheet.getRow(2).font = { italic: true, size: 11 };
        worksheet.getRow(3).font = { bold: true, size: 12, color: { argb: 'FF004B87' } };
        const headerRow1 = worksheet.addRow([
            'Nom du salarié',
            'Prénom du salarié',
            "Nombre d'heures de base",
            'Heures supp 25%',
            'Heures supp 50%',
            "Heures intempérie",
            "Absences / Maladies / Congés (heures)"
        ]);
        headerRow1.font = { bold: true };
        headerRow1.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEFEFEF' }
        };
        const empMap = {};
        for (const entry of entries) {
            const emp = entry.employee;
            if (!emp)
                continue;
            if (!empMap[emp.id]) {
                empMap[emp.id] = {
                    lastName: emp.lastName,
                    firstName: emp.firstName,
                    baseHours: emp.baseMonthlyHours || 151.67,
                    supp25: 0,
                    supp50: 0,
                    intemperieHours: 0,
                    absenceHours: 0,
                };
            }
            const category = entry.entryCategory || entry.type || '';
            if (category === 'INTEMPERIE' || entry.isBadWeather) {
                empMap[emp.id].intemperieHours += 7;
            }
            else if (category === 'ABSENCE' || category === 'LEAVE' || category === 'MALADIE') {
                empMap[emp.id].absenceHours += 7;
            }
        }
        Object.values(empMap).forEach(row => {
            worksheet.addRow([
                row.lastName,
                row.firstName,
                row.baseHours,
                row.supp25,
                row.supp50,
                row.intemperieHours,
                row.absenceHours
            ]);
        });
        worksheet.addRow([]);
        worksheet.addRow(['Détail du nombre d\'heures par chantier']).font = { bold: true, size: 12 };
        const headerRow2 = worksheet.addRow(['Salarié', 'Chantier', 'Date', 'Type d\'entrée', 'Durée (heures)']);
        headerRow2.font = { bold: true };
        entries.forEach(entry => {
            worksheet.addRow([
                entry.employee ? `${entry.employee.firstName} ${entry.employee.lastName}` : 'Inconnu',
                entry.mission ? entry.mission.title : 'Dépôt / Autre',
                entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('fr-FR') : '--',
                entry.entryCategory || entry.type || 'TRAVAIL',
                7
            ]);
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Heures_EDGS_${now.getFullYear()}_${now.getMonth() + 1}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
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
    (0, common_1.Get)('export-excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], TimeclockController.prototype, "exportExcel", null);
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