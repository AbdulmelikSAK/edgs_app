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
exports.WorksitesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const worksite_entity_1 = require("../database/entities/worksite.entity");
const client_entity_1 = require("../database/entities/client.entity");
let WorksitesService = class WorksitesService {
    worksiteRepo;
    clientRepo;
    constructor(worksiteRepo, clientRepo) {
        this.worksiteRepo = worksiteRepo;
        this.clientRepo = clientRepo;
    }
    async create(dto) {
        const client = dto.clientId ? await this.clientRepo.findOne({ where: { id: dto.clientId } }) : null;
        const ws = this.worksiteRepo.create({ ...dto, client: client ?? undefined });
        return this.worksiteRepo.save(ws);
    }
    findAll() {
        return this.worksiteRepo.find({ relations: { client: true }, where: { isActive: true } });
    }
    async findOne(id) {
        const ws = await this.worksiteRepo.findOne({ where: { id }, relations: { client: true } });
        if (!ws)
            throw new common_1.NotFoundException(`Chantier ${id} non trouvé`);
        return ws;
    }
    async update(id, dto) {
        const ws = await this.findOne(id);
        if (dto.clientId) {
            const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
            if (client)
                ws.client = client;
        }
        Object.assign(ws, dto);
        return this.worksiteRepo.save(ws);
    }
    async remove(id) {
        const ws = await this.findOne(id);
        ws.isActive = false;
        await this.worksiteRepo.save(ws);
    }
};
exports.WorksitesService = WorksitesService;
exports.WorksitesService = WorksitesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(worksite_entity_1.Worksite)),
    __param(1, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], WorksitesService);
//# sourceMappingURL=worksites.service.js.map