import { Repository } from 'typeorm';
import { WeeklyPlanning } from '../database/entities/weekly-planning.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreatePlanningDto } from './dto/create-planning.dto';
export declare class PlanningService {
    private planningRepo;
    private missionRepo;
    private employeeRepo;
    constructor(planningRepo: Repository<WeeklyPlanning>, missionRepo: Repository<Mission>, employeeRepo: Repository<Employee>);
    create(dto: CreatePlanningDto): Promise<WeeklyPlanning>;
    findByWeek(year: number, week: number): Promise<WeeklyPlanning[]>;
    remove(id: string): Promise<void>;
}
