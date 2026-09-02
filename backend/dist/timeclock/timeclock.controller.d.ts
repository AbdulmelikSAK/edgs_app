import { TimeclockService } from './timeclock.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import type { Response } from 'express';
export declare class TimeclockController {
    private readonly timeclockService;
    constructor(timeclockService: TimeclockService);
    create(dto: CreateTimeEntryDto): Promise<import("../database/entities/time-entry.entity").TimeEntry>;
    syncBatch(entries: CreateTimeEntryDto[]): Promise<import("../database/entities/time-entry.entity").TimeEntry[]>;
    findAllWithFilters(employeeId?: string, startDate?: string, endDate?: string, status?: string): Promise<import("../database/entities/time-entry.entity").TimeEntry[]>;
    exportExcel(res: Response, employeeId?: string, startDate?: string, endDate?: string): Promise<void>;
    findByEmployee(id: string, date?: string): Promise<import("../database/entities/time-entry.entity").TimeEntry[]>;
    findByMission(id: string): Promise<import("../database/entities/time-entry.entity").TimeEntry[]>;
    validateBatch(body: {
        employeeId?: string;
        startDate?: string;
        endDate?: string;
        validatedBy?: string;
    }): Promise<{
        updated: number;
    }>;
    validateEntry(id: string, body: {
        status: string;
        validationNote?: string;
        newTimestamp?: string;
        validatedBy?: string;
    }): Promise<import("../database/entities/time-entry.entity").TimeEntry>;
    findFlaggedForEmployee(id: string): Promise<import("../database/entities/time-entry.entity").TimeEntry[]>;
}
