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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mission_photo_entity_1 = require("../database/entities/mission-photo.entity");
const mission_entity_1 = require("../database/entities/mission.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const minio_service_1 = require("./minio.service");
const crypto_1 = require("crypto");
let PhotosService = class PhotosService {
    photoRepo;
    missionRepo;
    employeeRepo;
    minioService;
    constructor(photoRepo, missionRepo, employeeRepo, minioService) {
        this.photoRepo = photoRepo;
        this.missionRepo = missionRepo;
        this.employeeRepo = employeeRepo;
        this.minioService = minioService;
    }
    async uploadPhoto(missionId, file, type = mission_photo_entity_1.PhotoType.DURING, employeeId, notes) {
        const mission = await this.missionRepo.findOne({ where: { id: missionId } });
        if (!mission)
            throw new common_1.NotFoundException('Mission non trouvée');
        const employee = employeeId ? await this.employeeRepo.findOne({ where: { id: employeeId } }) : null;
        const filename = `${missionId}/${(0, crypto_1.randomUUID)()}-${file.originalname}`;
        const url = await this.minioService.uploadFile(filename, file.buffer, file.mimetype);
        const photo = this.photoRepo.create({
            mission,
            takenBy: employee ?? undefined,
            type,
            url,
            filename,
            notes,
        });
        return this.photoRepo.save(photo);
    }
    findByMission(missionId) {
        return this.photoRepo.find({
            where: { mission: { id: missionId } },
            relations: { takenBy: true },
            order: { createdAt: 'ASC' },
        });
    }
    async remove(id) {
        const photo = await this.photoRepo.findOne({ where: { id } });
        if (!photo)
            throw new common_1.NotFoundException('Photo non trouvée');
        if (photo.filename) {
            try {
                await this.minioService.deleteFile(photo.filename);
            }
            catch { }
        }
        await this.photoRepo.delete(id);
    }
};
exports.PhotosService = PhotosService;
exports.PhotosService = PhotosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mission_photo_entity_1.MissionPhoto)),
    __param(1, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        minio_service_1.MinioService])
], PhotosService);
//# sourceMappingURL=photos.service.js.map