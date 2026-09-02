import { Mission } from './mission.entity';
import { Employee } from './employee.entity';
export declare class WeeklyPlanning {
    id: string;
    year: number;
    week: number;
    dayOfWeek: number;
    mission: Mission;
    employees: Employee[];
    teamLeaderId?: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
