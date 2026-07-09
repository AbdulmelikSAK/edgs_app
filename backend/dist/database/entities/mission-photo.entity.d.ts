import { Mission } from './mission.entity';
import { Employee } from './employee.entity';
export declare enum PhotoType {
    BEFORE = "before",
    DURING = "during",
    AFTER = "after"
}
export declare class MissionPhoto {
    id: string;
    mission: Mission;
    takenBy: Employee;
    type: PhotoType;
    url: string;
    filename: string;
    notes: string;
    createdAt: Date;
}
