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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_entity_1 = require("../database/entities/report.entity");
const mission_entity_1 = require("../database/entities/mission.entity");
const mission_photo_entity_1 = require("../database/entities/mission-photo.entity");
const time_entry_entity_1 = require("../database/entities/time-entry.entity");
const stock_movement_entity_1 = require("../database/entities/stock-movement.entity");
const minio_service_1 = require("../photos/minio.service");
let ReportsService = class ReportsService {
    reportRepo;
    missionRepo;
    photoRepo;
    timeRepo;
    stockRepo;
    minioService;
    constructor(reportRepo, missionRepo, photoRepo, timeRepo, stockRepo, minioService) {
        this.reportRepo = reportRepo;
        this.missionRepo = missionRepo;
        this.photoRepo = photoRepo;
        this.timeRepo = timeRepo;
        this.stockRepo = stockRepo;
        this.minioService = minioService;
    }
    async generateReport(missionId, userId) {
        const mission = await this.missionRepo.findOne({
            where: { id: missionId },
            relations: { truck: true, client: true, worksite: true },
        });
        if (!mission)
            throw new common_1.NotFoundException('Mission non trouvée');
        const photos = await this.photoRepo.find({ where: { mission: { id: missionId } } });
        const timeEntries = await this.timeRepo.find({ where: { mission: { id: missionId } }, relations: { employee: true } });
        const stockMovements = await this.stockRepo.find({ where: { mission: { id: missionId } } });
        const report = this.reportRepo.create({
            mission,
            status: report_entity_1.ReportStatus.GENERATING,
        });
        await this.reportRepo.save(report);
        const html = this.buildReportHtml(mission, photos, timeEntries, stockMovements);
        try {
            const filename = `reports/report-${missionId}-${Date.now()}.html`;
            const buffer = Buffer.from(html);
            const url = await this.minioService.uploadFile(filename, buffer, 'text/html');
            report.status = report_entity_1.ReportStatus.READY;
            report.url = url;
            report.filename = filename;
        }
        catch (err) {
            report.status = report_entity_1.ReportStatus.ERROR;
            report.errorMessage = err.message;
        }
        return this.reportRepo.save(report);
    }
    buildReportHtml(mission, photos, timeEntries, stock) {
        const totalSandBags = stock.filter(s => s.type === 'consume').reduce((sum, s) => sum + s.quantity, 0);
        const workHours = this.calculateWorkHours(timeEntries);
        return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
  h1 { color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 10px; }
  h2 { color: #374151; margin-top: 30px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th { background: #1a56db; color: white; padding: 10px; text-align: left; }
  td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
  .badge { background: #10b981; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; }
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
  .stat-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
  .stat-value { font-size: 28px; font-weight: bold; color: #1a56db; }
  .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
  .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .photo-grid img { width: 100%; border-radius: 8px; }
</style>
</head>
<body>
<h1>Rapport de Mission — EDGS</h1>
<p><strong>Mission :</strong> ${mission.title}</p>
<p><strong>Client :</strong> ${mission.client?.name || 'N/A'}</p>
<p><strong>Chantier :</strong> ${mission.worksite?.name || 'N/A'} — ${mission.worksite?.address || ''}</p>
<p><strong>Camion :</strong> ${mission.truck?.plateNumber || 'N/A'}</p>
<p><strong>Date :</strong> ${new Date(mission.scheduledDate).toLocaleDateString('fr-FR')}</p>
<p><strong>Statut :</strong> <span class="badge">${mission.status}</span></p>

<h2>Statistiques</h2>
<div class="stats-grid">
  <div class="stat-card"><div class="stat-value">${workHours.toFixed(1)}h</div><div class="stat-label">Heures travail</div></div>
  <div class="stat-card"><div class="stat-value">${totalSandBags}</div><div class="stat-label">Sacs de sable</div></div>
  <div class="stat-card"><div class="stat-value">${mission.surfaceArea || 0} m²</div><div class="stat-label">Surface traitée</div></div>
  <div class="stat-card"><div class="stat-value">${mission.fuelConsumption || 0} L</div><div class="stat-label">Carburant</div></div>
  <div class="stat-card"><div class="stat-value">${mission.actualPrice ? mission.actualPrice + '€' : 'N/A'}</div><div class="stat-label">Prix réel</div></div>
  <div class="stat-card"><div class="stat-value">${mission.estimatedPrice ? mission.estimatedPrice + '€' : 'N/A'}</div><div class="stat-label">Prix estimé</div></div>
</div>

<h2>Pointages (${timeEntries.length})</h2>
<table>
<tr><th>Employé</th><th>Type</th><th>Heure</th><th>Position</th></tr>
${timeEntries.map(t => `<tr><td>${t.employee?.firstName} ${t.employee?.lastName}</td><td>${t.type}</td><td>${new Date(t.timestamp).toLocaleString('fr-FR')}</td><td>${t.latitude ? t.latitude.toFixed(4) + ', ' + t.longitude.toFixed(4) : 'N/A'}</td></tr>`).join('')}
</table>

<h2>Photos (${photos.length})</h2>
<div class="photo-grid">
${photos.map(p => `<img src="${p.url}" alt="${p.type}" />`).join('')}
</div>

${mission.notes ? `<h2>Notes</h2><p>${mission.notes}</p>` : ''}

<p style="margin-top: 40px; color: #9ca3af; font-size: 12px;">Rapport généré le ${new Date().toLocaleString('fr-FR')} — EDGS</p>
</body></html>`;
    }
    calculateWorkHours(timeEntries) {
        const starts = timeEntries.filter(t => t.type === 'day_start' || t.type === 'mission_start');
        const ends = timeEntries.filter(t => t.type === 'day_end' || t.type === 'mission_end');
        if (!starts.length || !ends.length)
            return 0;
        const start = new Date(starts[0].timestamp).getTime();
        const end = new Date(ends[ends.length - 1].timestamp).getTime();
        return Math.max(0, (end - start) / 3600000);
    }
    findAll() {
        return this.reportRepo.find({
            relations: { mission: true },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const r = await this.reportRepo.findOne({ where: { id }, relations: { mission: true } });
        if (!r)
            throw new common_1.NotFoundException('Rapport non trouvé');
        return r;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __param(1, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(2, (0, typeorm_1.InjectRepository)(mission_photo_entity_1.MissionPhoto)),
    __param(3, (0, typeorm_1.InjectRepository)(time_entry_entity_1.TimeEntry)),
    __param(4, (0, typeorm_1.InjectRepository)(stock_movement_entity_1.StockMovement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        minio_service_1.MinioService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map