import { Mission } from './mission.entity';
import { Employee } from './employee.entity';
import { Worksite } from './worksite.entity';
export declare enum PhotoType {
    BEFORE = "before",
    DURING = "during",
    AFTER = "after"
}
export declare class MissionPhoto {
    id: string;
    mission?: Mission | null;
    worksite?: Worksite | null;
    takenBy?: Employee | null;
    type: PhotoType;
    url: string;
    filename: string;
    notes: string;
    createdAt: Date;
}
