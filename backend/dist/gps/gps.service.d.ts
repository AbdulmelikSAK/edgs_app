import { Repository } from 'typeorm';
import { GpsPoint } from '../database/entities/gps-point.entity';
import { Truck } from '../database/entities/truck.entity';
import { Mission } from '../database/entities/mission.entity';
import { CreateGpsPointDto } from './dto/create-gps-point.dto';
export declare class GpsService {
    private gpsRepo;
    private truckRepo;
    private missionRepo;
    constructor(gpsRepo: Repository<GpsPoint>, truckRepo: Repository<Truck>, missionRepo: Repository<Mission>);
    track(dto: CreateGpsPointDto): Promise<GpsPoint>;
    syncBatch(points: CreateGpsPointDto[]): Promise<GpsPoint[]>;
    getLivePositions(): Promise<any[]>;
    getHistory(truckId: string, from?: string, to?: string): Promise<GpsPoint[]>;
}
