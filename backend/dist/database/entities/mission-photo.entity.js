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
exports.MissionPhoto = exports.PhotoType = void 0;
const typeorm_1 = require("typeorm");
const mission_entity_1 = require("./mission.entity");
const employee_entity_1 = require("./employee.entity");
var PhotoType;
(function (PhotoType) {
    PhotoType["BEFORE"] = "before";
    PhotoType["DURING"] = "during";
    PhotoType["AFTER"] = "after";
})(PhotoType || (exports.PhotoType = PhotoType = {}));
let MissionPhoto = class MissionPhoto {
    id;
    mission;
    takenBy;
    type;
    url;
    filename;
    notes;
    createdAt;
};
exports.MissionPhoto = MissionPhoto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MissionPhoto.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => mission_entity_1.Mission),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", mission_entity_1.Mission)
], MissionPhoto.prototype, "mission", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", employee_entity_1.Employee)
], MissionPhoto.prototype, "takenBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PhotoType, default: PhotoType.DURING }),
    __metadata("design:type", String)
], MissionPhoto.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MissionPhoto.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MissionPhoto.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], MissionPhoto.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MissionPhoto.prototype, "createdAt", void 0);
exports.MissionPhoto = MissionPhoto = __decorate([
    (0, typeorm_1.Entity)('mission_photos')
], MissionPhoto);
//# sourceMappingURL=mission-photo.entity.js.map