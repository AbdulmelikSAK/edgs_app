"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorksitesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const worksites_controller_1 = require("./worksites.controller");
const worksites_service_1 = require("./worksites.service");
const worksite_entity_1 = require("../database/entities/worksite.entity");
const client_entity_1 = require("../database/entities/client.entity");
let WorksitesModule = class WorksitesModule {
};
exports.WorksitesModule = WorksitesModule;
exports.WorksitesModule = WorksitesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([worksite_entity_1.Worksite, client_entity_1.Client])],
        controllers: [worksites_controller_1.WorksitesController],
        providers: [worksites_service_1.WorksitesService],
        exports: [worksites_service_1.WorksitesService],
    })
], WorksitesModule);
//# sourceMappingURL=worksites.module.js.map