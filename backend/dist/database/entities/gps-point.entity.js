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
exports.GpsPoint = void 0;
const typeorm_1 = require("typeorm");
const truck_entity_1 = require("./truck.entity");
const mission_entity_1 = require("./mission.entity");
let GpsPoint = class GpsPoint {
    id;
    truck;
    mission;
    latitude;
    longitude;
    speed;
    accuracy;
    isSyncedFromOffline;
    isOutOfZone;
    createdAt;
};
exports.GpsPoint = GpsPoint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GpsPoint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => truck_entity_1.Truck),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", truck_entity_1.Truck)
], GpsPoint.prototype, "truck", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => mission_entity_1.Mission, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", mission_entity_1.Mission)
], GpsPoint.prototype, "mission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], GpsPoint.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], GpsPoint.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], GpsPoint.prototype, "speed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 6, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], GpsPoint.prototype, "accuracy", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], GpsPoint.prototype, "isSyncedFromOffline", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], GpsPoint.prototype, "isOutOfZone", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GpsPoint.prototype, "createdAt", void 0);
exports.GpsPoint = GpsPoint = __decorate([
    (0, typeorm_1.Entity)('gps_points')
], GpsPoint);
//# sourceMappingURL=gps-point.entity.js.map