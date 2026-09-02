import { Repository } from 'typeorm';
import { Mission, MissionStatus } from '../database/entities/mission.entity';
import { Truck } from '../database/entities/truck.entity';
import { Client } from '../database/entities/client.entity';
import { Worksite } from '../database/entities/worksite.entity';
import { Employee } from '../database/entities/employee.entity';
import { SiteSupervisor } from '../database/entities/site-supervisor.entity';
import { UpdateMissionDto } from './dto/update-mission.dto';
export declare class MissionsService {
    private missionRepo;
    private truckRepo;
    private clientRepo;
    private worksiteRepo;
    private employeeRepo;
    private siteSupervisorRepo;
    constructor(missionRepo: Repository<Mission>, truckRepo: Repository<Truck>, clientRepo: Repository<Client>, worksiteRepo: Repository<Worksite>, employeeRepo: Repository<Employee>, siteSupervisorRepo: Repository<SiteSupervisor>);
    create(dto: any): Promise<Mission>;
    findAll(): Promise<Mission[]>;
    findByTruck(truckId: string): Promise<Mission[]>;
    findOne(id: string): Promise<Mission>;
    update(id: string, dto: UpdateMissionDto): Promise<Mission>;
    updateStatus(id: string, status: MissionStatus): Promise<Mission>;
    remove(id: string): Promise<void>;
    findTodayMissions(employeeId: string): Promise<Mission[]>;
    findEmployeeMissions(employeeId: string): Promise<Mission[]>;
}
