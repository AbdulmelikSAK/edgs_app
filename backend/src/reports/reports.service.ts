import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from '../database/entities/report.entity';
import { Mission } from '../database/entities/mission.entity';
import { MissionPhoto } from '../database/entities/mission-photo.entity';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { MinioService } from '../photos/minio.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportRepo: Repository<Report>,
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(MissionPhoto) private photoRepo: Repository<MissionPhoto>,
    @InjectRepository(TimeEntry) private timeRepo: Repository<TimeEntry>,
    @InjectRepository(StockMovement) private stockRepo: Repository<StockMovement>,
    private minioService: MinioService,
  ) {}

  async generateReport(missionId: string, userId?: string): Promise<Report> {
    const mission = await this.missionRepo.findOne({
      where: { id: missionId },
      relations: { truck: true, client: true, worksite: true },
    });
    if (!mission) throw new NotFoundException('Mission non trouvée');

    const photos = await this.photoRepo.find({ where: { mission: { id: missionId } } });
    const timeEntries = await this.timeRepo.find({ where: { mission: { id: missionId } }, relations: { employee: true } });
    const stockMovements = await this.stockRepo.find({ where: { mission: { id: missionId } } });

    const report = this.reportRepo.create({
      mission,
      status: ReportStatus.GENERATING,
    });
    await this.reportRepo.save(report);

    const html = this.buildReportHtml(mission, photos, timeEntries, stockMovements);
    
    try {
      const filename = `reports/report-${missionId}-${Date.now()}.html`;
      const buffer = Buffer.from(html);
      const url = await this.minioService.uploadFile(filename, buffer, 'text/html');
      
      report.status = ReportStatus.READY;
      report.url = url;
      report.filename = filename;
    } catch (err) {
      report.status = ReportStatus.ERROR;
      report.errorMessage = err.message;
    }

    return this.reportRepo.save(report);
  }

  private buildReportHtml(mission: any, photos: any[], timeEntries: any[], stock: any[]): string {
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

  private calculateWorkHours(timeEntries: any[]): number {
    const starts = timeEntries.filter(t => t.type === 'day_start' || t.type === 'mission_start');
    const ends = timeEntries.filter(t => t.type === 'day_end' || t.type === 'mission_end');
    if (!starts.length || !ends.length) return 0;
    const start = new Date(starts[0].timestamp).getTime();
    const end = new Date(ends[ends.length - 1].timestamp).getTime();
    return Math.max(0, (end - start) / 3600000);
  }

  async findAll(): Promise<Report[]> {
    const list = await this.reportRepo.find({
      relations: { mission: true },
      order: { createdAt: 'DESC' },
    });
    return list.map(r => {
      r.url = `/reports/view/${r.id}`;
      return r;
    });
  }

  async findOne(id: string): Promise<Report> {
    const r = await this.reportRepo.findOne({ where: { id }, relations: { mission: true } });
    if (!r) throw new NotFoundException('Rapport non trouvé');
    r.url = `/reports/view/${r.id}`;
    return r;
  }

  async getReportStream(id: string): Promise<any> {
    const report = await this.findOne(id);
    if (!report.filename) {
      throw new NotFoundException('Fichier de rapport non disponible');
    }
    return this.minioService.getFileStream(report.filename);
  }
}
