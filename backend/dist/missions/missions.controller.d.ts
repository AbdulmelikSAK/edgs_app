import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { MissionStatus } from '../database/entities/mission.entity';
import type { Response } from 'express';
export declare class MissionsController {
    private readonly missionsService;
    constructor(missionsService: MissionsService);
    create(dto: CreateMissionDto): Promise<import("../database/entities/mission.entity").Mission>;
    findAll(): Promise<import("../database/entities/mission.entity").Mission[]>;
    exportExcel(res: Response): Promise<void>;
    findToday(employeeId: string): Promise<import("../database/entities/mission.entity").Mission[]>;
    findByEmployee(employeeId: string): Promise<import("../database/entities/mission.entity").Mission[]>;
    findByTruck(truckId: string): Promise<import("../database/entities/mission.entity").Mission[]>;
    findOne(id: string): Promise<import("../database/entities/mission.entity").Mission>;
    update(id: string, dto: UpdateMissionDto): Promise<import("../database/entities/mission.entity").Mission>;
    updateStatus(id: string, status: MissionStatus): Promise<import("../database/entities/mission.entity").Mission>;
    remove(id: string): Promise<void>;
}
