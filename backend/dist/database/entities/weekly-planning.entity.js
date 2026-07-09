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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeklyPlanning = void 0;
const typeorm_1 = require("typeorm");
const mission_entity_1 = require("./mission.entity");
const truck_entity_1 = require("./truck.entity");
let WeeklyPlanning = class WeeklyPlanning {
    id;
    year;
    week;
    dayOfWeek;
    mission;
    truck;
    notes;
    createdAt;
    updatedAt;
};
exports.WeeklyPlanning = WeeklyPlanning;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WeeklyPlanning.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], WeeklyPlanning.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], WeeklyPlanning.prototype, "week", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], WeeklyPlanning.prototype, "dayOfWeek", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => mission_entity_1.Mission),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", mission_entity_1.Mission)
], WeeklyPlanning.prototype, "mission", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => truck_entity_1.Truck, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", truck_entity_1.Truck)
], WeeklyPlanning.prototype, "truck", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], WeeklyPlanning.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WeeklyPlanning.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WeeklyPlanning.prototype, "updatedAt", void 0);
exports.WeeklyPlanning = WeeklyPlanning = __decorate([
    (0, typeorm_1.Entity)('weekly_planning')
], WeeklyPlanning);
//# sourceMappingURL=weekly-planning.entity.js.map