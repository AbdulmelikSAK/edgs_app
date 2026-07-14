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
exports.TimeEntry = exports.TimeEntryType = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
const mission_entity_1 = require("./mission.entity");
const truck_entity_1 = require("./truck.entity");
var TimeEntryType;
(function (TimeEntryType) {
    TimeEntryType["DAY_START"] = "day_start";
    TimeEntryType["DAY_END"] = "day_end";
    TimeEntryType["MISSION_START"] = "mission_start";
    TimeEntryType["MISSION_END"] = "mission_end";
    TimeEntryType["PAUSE_START"] = "pause_start";
    TimeEntryType["PAUSE_END"] = "pause_end";
})(TimeEntryType || (exports.TimeEntryType = TimeEntryType = {}));
let TimeEntry = class TimeEntry {
    id;
    employee;
    truck;
    mission;
    type;
    timestamp;
    latitude;
    longitude;
    notes;
    displacementMode;
    signature;
    isOutOfZone;
    isSyncedFromOffline;
    createdAt;
};
exports.TimeEntry = TimeEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TimeEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", employee_entity_1.Employee)
], TimeEntry.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => truck_entity_1.Truck, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", truck_entity_1.Truck)
], TimeEntry.prototype, "truck", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => mission_entity_1.Mission, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", mission_entity_1.Mission)
], TimeEntry.prototype, "mission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TimeEntryType }),
    __metadata("design:type", String)
], TimeEntry.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], TimeEntry.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], TimeEntry.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TimeEntry.prototype, "displacementMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], TimeEntry.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TimeEntry.prototype, "isOutOfZone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TimeEntry.prototype, "isSyncedFromOffline", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TimeEntry.prototype, "createdAt", void 0);
exports.TimeEntry = TimeEntry = __decorate([
    (0, typeorm_1.Entity)('time_entries')
], TimeEntry);
//# sourceMappingURL=time-entry.entity.js.map