import { Repository } from 'typeorm';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { Employee } from '../database/entities/employee.entity';
import { Mission } from '../database/entities/mission.entity';
import { Truck } from '../database/entities/truck.entity';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
export declare class TimeclockService {
    private timeEntryRepo;
    private employeeRepo;
    private missionRepo;
    private truckRepo;
    constructor(timeEntryRepo: Repository<TimeEntry>, employeeRepo: Repository<Employee>, missionRepo: Repository<Mission>, truckRepo: Repository<Truck>);
    createEntry(dto: CreateTimeEntryDto): Promise<TimeEntry>;
    syncBatch(entries: CreateTimeEntryDto[]): Promise<TimeEntry[]>;
    findByEmployee(employeeId: string, date?: string): Promise<TimeEntry[]>;
    findByMission(missionId: string): Promise<TimeEntry[]>;
    validateEntry(id: string, status: any, validationNote?: string, newTimestamp?: string, validatedBy?: string): Promise<TimeEntry>;
    validateBatch(employeeId?: string, startDate?: string, endDate?: string, validatedBy?: string): Promise<{
        updated: number;
    }>;
    findFlaggedForEmployee(employeeId: string): Promise<TimeEntry[]>;
    findAllWithFilters(employeeId?: string, startDate?: string, endDate?: string, status?: string): Promise<TimeEntry[]>;
}
