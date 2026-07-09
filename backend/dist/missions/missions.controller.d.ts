import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { MissionStatus } from '../database/entities/mission.entity';
export declare class MissionsController {
    private readonly missionsService;
    constructor(missionsService: MissionsService);
    create(dto: CreateMissionDto): Promise<import("../database/entities/mission.entity").Mission>;
    findAll(): Promise<import("../database/entities/mission.entity").Mission[]>;
    findToday(truckId: string): Promise<import("../database/entities/mission.entity").Mission[]>;
    findByTruck(truckId: string): Promise<import("../database/entities/mission.entity").Mission[]>;
    findOne(id: string): Promise<import("../database/entities/mission.entity").Mission>;
    update(id: string, dto: UpdateMissionDto): Promise<import("../database/entities/mission.entity").Mission>;
    updateStatus(id: string, status: MissionStatus): Promise<import("../database/entities/mission.entity").Mission>;
    remove(id: string): Promise<void>;
}
