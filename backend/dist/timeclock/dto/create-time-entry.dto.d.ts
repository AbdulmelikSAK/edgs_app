import { TimeEntryType } from '../../database/entities/time-entry.entity';
export declare class CreateTimeEntryDto {
    employeeId: string;
    missionId?: string;
    truckId?: string;
    type: TimeEntryType;
    timestamp?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    displacementMode?: string;
    signature?: string;
    isOutOfZone?: boolean;
    isSyncedFromOffline?: boolean;
}
