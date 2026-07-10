import { ReportsService } from './reports.service';
import type { Response } from 'express';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    generate(missionId: string): Promise<import("../database/entities/report.entity").Report>;
    findAll(): Promise<import("../database/entities/report.entity").Report[]>;
    findOne(id: string): Promise<import("../database/entities/report.entity").Report>;
    viewReport(id: string, res: Response): Promise<void>;
}
