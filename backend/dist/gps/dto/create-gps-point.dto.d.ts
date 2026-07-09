export declare class CreateGpsPointDto {
    truckId: string;
    missionId?: string;
    latitude: number;
    longitude: number;
    speed?: number;
    accuracy?: number;
    isSyncedFromOffline?: boolean;
}
