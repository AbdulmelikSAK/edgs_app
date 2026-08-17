import { Repository } from 'typeorm';
import { MissionPhoto, PhotoType } from '../database/entities/mission-photo.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';
import { Worksite } from '../database/entities/worksite.entity';
import { MinioService } from './minio.service';
export declare class PhotosService {
    private photoRepo;
    private missionRepo;
    private employeeRepo;
    private worksiteRepo;
    private minioService;
    constructor(photoRepo: Repository<MissionPhoto>, missionRepo: Repository<Mission>, employeeRepo: Repository<Employee>, worksiteRepo: Repository<Worksite>, minioService: MinioService);
    uploadPhoto(missionId: string, file: Express.Multer.File, type?: PhotoType, employeeId?: string, notes?: string): Promise<MissionPhoto>;
    uploadWorksitePhoto(worksiteId: string, file: Express.Multer.File, notes?: string): Promise<MissionPhoto>;
    findByMission(missionId: string): Promise<MissionPhoto[]>;
    findByWorksite(worksiteId: string): Promise<MissionPhoto[]>;
    remove(id: string): Promise<void>;
}
