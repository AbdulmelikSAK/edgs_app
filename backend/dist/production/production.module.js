"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const production_entry_entity_1 = require("../database/entities/production-entry.entity");
const mission_entity_1 = require("../database/entities/mission.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const production_service_1 = require("./production.service");
const production_controller_1 = require("./production.controller");
let ProductionModule = class ProductionModule {
};
exports.ProductionModule = ProductionModule;
exports.ProductionModule = ProductionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([production_entry_entity_1.ProductionEntry, mission_entity_1.Mission, employee_entity_1.Employee])],
        providers: [production_service_1.ProductionService],
        controllers: [production_controller_1.ProductionController],
        exports: [production_service_1.ProductionService],
    })
], ProductionModule);
//# sourceMappingURL=production.module.js.map