import { ProductionService } from './production.service';
import { CreateProductionEntryDto } from './dto/create-production-entry.dto';
export declare class ProductionController {
    private readonly productionService;
    constructor(productionService: ProductionService);
    create(dto: CreateProductionEntryDto): Promise<import("../database/entities/production-entry.entity").ProductionEntry>;
    findAll(missionId?: string): Promise<import("../database/entities/production-entry.entity").ProductionEntry[]>;
    getStatsToday(): Promise<any>;
}
