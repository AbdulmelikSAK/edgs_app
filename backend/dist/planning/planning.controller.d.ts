import { PlanningService } from './planning.service';
import { CreatePlanningDto } from './dto/create-planning.dto';
export declare class PlanningController {
    private readonly planningService;
    constructor(planningService: PlanningService);
    create(dto: CreatePlanningDto): Promise<import("../database/entities/weekly-planning.entity").WeeklyPlanning>;
    findByWeek(year: string, week: string): Promise<import("../database/entities/weekly-planning.entity").WeeklyPlanning[]>;
    remove(id: string): Promise<void>;
}
