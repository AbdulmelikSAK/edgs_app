import { Employee } from './employee.entity';
import { Mission } from './mission.entity';
import { Truck } from './truck.entity';
export declare enum TimeEntryType {
    DAY_START = "day_start",
    DAY_END = "day_end",
    MISSION_START = "mission_start",
    MISSION_END = "mission_end",
    PAUSE_START = "pause_start",
    PAUSE_END = "pause_end"
}
export declare class TimeEntry {
    id: string;
    employee: Employee;
    truck: Truck;
    mission: Mission;
    type: TimeEntryType;
    timestamp: Date;
    latitude: number;
    longitude: number;
    notes: string;
    displacementMode: string;
    signature: string;
    isOutOfZone: boolean;
    isSyncedFromOffline: boolean;
    createdAt: Date;
}
