import { WorksitesService } from './worksites.service';
import { CreateWorksiteDto } from './dto/create-worksite.dto';
import { UpdateWorksiteDto } from './dto/update-worksite.dto';
export declare class WorksitesController {
    private readonly worksitesService;
    constructor(worksitesService: WorksitesService);
    create(dto: CreateWorksiteDto): Promise<import("../database/entities/worksite.entity").Worksite>;
    findAll(): Promise<import("../database/entities/worksite.entity").Worksite[]>;
    findOne(id: string): Promise<import("../database/entities/worksite.entity").Worksite>;
    update(id: string, dto: UpdateWorksiteDto): Promise<import("../database/entities/worksite.entity").Worksite>;
    remove(id: string): Promise<void>;
}
