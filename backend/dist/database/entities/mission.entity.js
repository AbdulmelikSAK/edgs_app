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
exports.Mission = exports.MissionStatus = void 0;
const typeorm_1 = require("typeorm");
const truck_entity_1 = require("./truck.entity");
const client_entity_1 = require("./client.entity");
const worksite_entity_1 = require("./worksite.entity");
var MissionStatus;
(function (MissionStatus) {
    MissionStatus["PLANNED"] = "planned";
    MissionStatus["IN_PROGRESS"] = "in_progress";
    MissionStatus["COMPLETED"] = "completed";
    MissionStatus["CANCELLED"] = "cancelled";
})(MissionStatus || (exports.MissionStatus = MissionStatus = {}));
let Mission = class Mission {
    id;
    title;
    description;
    status;
    scheduledDate;
    startedAt;
    completedAt;
    estimatedPrice;
    actualPrice;
    surfaceArea;
    fuelConsumption;
    sandBagsUsed;
    notes;
    truck;
    client;
    worksite;
    createdAt;
    updatedAt;
};
exports.Mission = Mission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Mission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mission.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Mission.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MissionStatus, default: MissionStatus.PLANNED }),
    __metadata("design:type", String)
], Mission.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Mission.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Mission.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Mission.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Mission.prototype, "estimatedPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Mission.prototype, "actualPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Mission.prototype, "surfaceArea", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Mission.prototype, "fuelConsumption", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Mission.prototype, "sandBagsUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Mission.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => truck_entity_1.Truck, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", truck_entity_1.Truck)
], Mission.prototype, "truck", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", client_entity_1.Client)
], Mission.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => worksite_entity_1.Worksite, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", worksite_entity_1.Worksite)
], Mission.prototype, "worksite", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Mission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Mission.prototype, "updatedAt", void 0);
exports.Mission = Mission = __decorate([
    (0, typeorm_1.Entity)('missions')
], Mission);
//# sourceMappingURL=mission.entity.js.map