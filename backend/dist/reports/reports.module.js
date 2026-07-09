"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
const report_entity_1 = require("../database/entities/report.entity");
const mission_entity_1 = require("../database/entities/mission.entity");
const mission_photo_entity_1 = require("../database/entities/mission-photo.entity");
const time_entry_entity_1 = require("../database/entities/time-entry.entity");
const stock_movement_entity_1 = require("../database/entities/stock-movement.entity");
const gps_point_entity_1 = require("../database/entities/gps-point.entity");
const photos_module_1 = require("../photos/photos.module");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([report_entity_1.Report, mission_entity_1.Mission, mission_photo_entity_1.MissionPhoto, time_entry_entity_1.TimeEntry, stock_movement_entity_1.StockMovement, gps_point_entity_1.GpsPoint]),
            photos_module_1.PhotosModule,
        ],
        controllers: [reports_controller_1.ReportsController],
        providers: [reports_service_1.ReportsService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map