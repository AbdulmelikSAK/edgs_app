import { Repository } from 'typeorm';
import { Worksite } from '../database/entities/worksite.entity';
import { Client } from '../database/entities/client.entity';
import { CreateWorksiteDto } from './dto/create-worksite.dto';
import { UpdateWorksiteDto } from './dto/update-worksite.dto';
export declare class WorksitesService {
    private worksiteRepo;
    private clientRepo;
    constructor(worksiteRepo: Repository<Worksite>, clientRepo: Repository<Client>);
    create(dto: CreateWorksiteDto): Promise<Worksite>;
    findAll(): Promise<Worksite[]>;
    findOne(id: string): Promise<Worksite>;
    update(id: string, dto: UpdateWorksiteDto): Promise<Worksite>;
    remove(id: string): Promise<void>;
}
