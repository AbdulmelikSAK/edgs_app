import { Repository } from 'typeorm';
import { ProductionEntry } from '../database/entities/production-entry.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateProductionEntryDto } from './dto/create-production-entry.dto';
export declare class ProductionService {
    private readonly productionRepo;
    private readonly missionRepo;
    private readonly employeeRepo;
    constructor(productionRepo: Repository<ProductionEntry>, missionRepo: Repository<Mission>, employeeRepo: Repository<Employee>);
    create(dto: CreateProductionEntryDto): Promise<ProductionEntry>;
    findAll(missionId?: string): Promise<ProductionEntry[]>;
    getProductionStatsToday(): Promise<any>;
}
