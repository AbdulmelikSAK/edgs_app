import { GpsService } from './gps.service';
import { CreateGpsPointDto } from './dto/create-gps-point.dto';
export declare class GpsController {
    private readonly gpsService;
    constructor(gpsService: GpsService);
    track(dto: CreateGpsPointDto): Promise<import("../database/entities/gps-point.entity").GpsPoint>;
    syncBatch(points: CreateGpsPointDto[]): Promise<import("../database/entities/gps-point.entity").GpsPoint[]>;
    getLivePositions(): Promise<any[]>;
    getHistory(truckId: string, from?: string, to?: string): Promise<import("../database/entities/gps-point.entity").GpsPoint[]>;
}
