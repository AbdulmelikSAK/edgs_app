import { TimeclockService } from './timeclock.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
export declare class TimeclockController {
    private readonly timeclockService;
    constructor(timeclockService: TimeclockService);
    create(dto: CreateTimeEntryDto): Promise<import("../database/entities/time-entry.entity").TimeEntry>;
    syncBatch(entries: CreateTimeEntryDto[]): Promise<import("../database/entities/time-entry.entity").TimeEntry[]>;
    findByEmployee(id: string, date?: string): Promise<import("../database/entities/time-entry.entity").TimeEntry[]>;
    findByMission(id: string): Promise<import("../database/entities/time-entry.entity").TimeEntry[]>;
}
