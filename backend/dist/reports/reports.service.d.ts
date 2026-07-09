import { Repository } from 'typeorm';
import { Report } from '../database/entities/report.entity';
import { Mission } from '../database/entities/mission.entity';
import { MissionPhoto } from '../database/entities/mission-photo.entity';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { MinioService } from '../photos/minio.service';
export declare class ReportsService {
    private reportRepo;
    private missionRepo;
    private photoRepo;
    private timeRepo;
    private stockRepo;
    private minioService;
    constructor(reportRepo: Repository<Report>, missionRepo: Repository<Mission>, photoRepo: Repository<MissionPhoto>, timeRepo: Repository<TimeEntry>, stockRepo: Repository<StockMovement>, minioService: MinioService);
    generateReport(missionId: string, userId?: string): Promise<Report>;
    private buildReportHtml;
    private calculateWorkHours;
    findAll(): Promise<Report[]>;
    findOne(id: string): Promise<Report>;
}
