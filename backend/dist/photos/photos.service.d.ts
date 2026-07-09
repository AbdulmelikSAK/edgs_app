import { Repository } from 'typeorm';
import { MissionPhoto, PhotoType } from '../database/entities/mission-photo.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';
import { MinioService } from './minio.service';
export declare class PhotosService {
    private photoRepo;
    private missionRepo;
    private employeeRepo;
    private minioService;
    constructor(photoRepo: Repository<MissionPhoto>, missionRepo: Repository<Mission>, employeeRepo: Repository<Employee>, minioService: MinioService);
    uploadPhoto(missionId: string, file: Express.Multer.File, type?: PhotoType, employeeId?: string, notes?: string): Promise<MissionPhoto>;
    findByMission(missionId: string): Promise<MissionPhoto[]>;
    remove(id: string): Promise<void>;
}
