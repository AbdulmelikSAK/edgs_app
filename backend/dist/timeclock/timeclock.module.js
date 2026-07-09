"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeclockModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const timeclock_controller_1 = require("./timeclock.controller");
const timeclock_service_1 = require("./timeclock.service");
const time_entry_entity_1 = require("../database/entities/time-entry.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const mission_entity_1 = require("../database/entities/mission.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
let TimeclockModule = class TimeclockModule {
};
exports.TimeclockModule = TimeclockModule;
exports.TimeclockModule = TimeclockModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([time_entry_entity_1.TimeEntry, employee_entity_1.Employee, mission_entity_1.Mission, truck_entity_1.Truck])],
        controllers: [timeclock_controller_1.TimeclockController],
        providers: [timeclock_service_1.TimeclockService],
        exports: [timeclock_service_1.TimeclockService],
    })
], TimeclockModule);
//# sourceMappingURL=timeclock.module.js.map