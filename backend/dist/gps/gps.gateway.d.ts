import { Server, Socket } from 'socket.io';
import { GpsService } from './gps.service';
import { CreateGpsPointDto } from './dto/create-gps-point.dto';
export declare class GpsGateway {
    private readonly gpsService;
    server: Server;
    constructor(gpsService: GpsService);
    handleTrack(dto: CreateGpsPointDto, client: Socket): Promise<import("../database/entities/gps-point.entity").GpsPoint>;
    handleJoinBackoffice(client: Socket): {
        event: string;
        room: string;
    };
}
