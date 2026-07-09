import { Truck } from './truck.entity';
import { Mission } from './mission.entity';
export declare class GpsPoint {
    id: string;
    truck: Truck;
    mission: Mission;
    latitude: number;
    longitude: number;
    speed: number;
    accuracy: number;
    isSyncedFromOffline: boolean;
    createdAt: Date;
}
