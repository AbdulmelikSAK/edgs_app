import { Mission } from './mission.entity';
import { Truck } from './truck.entity';
export declare class WeeklyPlanning {
    id: string;
    year: number;
    week: number;
    dayOfWeek: number;
    mission: Mission;
    truck: Truck;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
