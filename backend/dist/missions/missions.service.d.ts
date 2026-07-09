import { Repository } from 'typeorm';
import { Mission, MissionStatus } from '../database/entities/mission.entity';
import { Truck } from '../database/entities/truck.entity';
import { Client } from '../database/entities/client.entity';
import { Worksite } from '../database/entities/worksite.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
export declare class MissionsService {
    private missionRepo;
    private truckRepo;
    private clientRepo;
    private worksiteRepo;
    constructor(missionRepo: Repository<Mission>, truckRepo: Repository<Truck>, clientRepo: Repository<Client>, worksiteRepo: Repository<Worksite>);
    create(dto: CreateMissionDto): Promise<Mission>;
    findAll(): Promise<Mission[]>;
    findByTruck(truckId: string): Promise<Mission[]>;
    findOne(id: string): Promise<Mission>;
    update(id: string, dto: UpdateMissionDto): Promise<Mission>;
    updateStatus(id: string, status: MissionStatus): Promise<Mission>;
    remove(id: string): Promise<void>;
    findTodayMissions(truckId: string): Promise<Mission[]>;
}
