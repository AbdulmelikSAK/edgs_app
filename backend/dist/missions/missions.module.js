"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const missions_controller_1 = require("./missions.controller");
const missions_service_1 = require("./missions.service");
const mission_entity_1 = require("../database/entities/mission.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
const client_entity_1 = require("../database/entities/client.entity");
const worksite_entity_1 = require("../database/entities/worksite.entity");
let MissionsModule = class MissionsModule {
};
exports.MissionsModule = MissionsModule;
exports.MissionsModule = MissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([mission_entity_1.Mission, truck_entity_1.Truck, client_entity_1.Client, worksite_entity_1.Worksite])],
        controllers: [missions_controller_1.MissionsController],
        providers: [missions_service_1.MissionsService],
        exports: [missions_service_1.MissionsService],
    })
], MissionsModule);
//# sourceMappingURL=missions.module.js.map