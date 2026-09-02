import { Employee } from './employee.entity';
import { Mission } from './mission.entity';
import { Truck } from './truck.entity';
export declare enum TimeEntryType {
    DAY_START = "day_start",
    DAY_END = "day_end",
    MISSION_START = "mission_start",
    MISSION_END = "mission_end",
    PAUSE_START = "pause_start",
    PAUSE_END = "pause_end",
    INTEMPERIE = "intemperie"
}
export declare enum TimeEntryStatus {
    PENDING = "pending",
    VALIDATED = "validated",
    REJECTED = "rejected",
    MODIFIED = "modified"
}
export declare class TimeEntry {
    id: string;
    employee: Employee;
    truck: Truck;
    mission: Mission;
    type: TimeEntryType;
    entryCategory: string;
    isBadWeather: boolean;
    hoursWorked: number;
    timestamp: Date;
    latitude: number;
    longitude: number;
    notes: string;
    displacementMode: string;
    signature: string;
    isOutOfZone: boolean;
    isSyncedFromOffline: boolean;
    validationStatus: TimeEntryStatus;
    validationNote: string;
    validatedAt: Date;
    validatedBy: string;
    createdAt: Date;
}
