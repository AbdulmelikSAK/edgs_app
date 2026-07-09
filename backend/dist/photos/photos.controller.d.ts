import { PhotosService } from './photos.service';
import { PhotoType } from '../database/entities/mission-photo.entity';
export declare class PhotosController {
    private readonly photosService;
    constructor(photosService: PhotosService);
    uploadPhoto(missionId: string, file: Express.Multer.File, type: PhotoType, employeeId?: string, notes?: string): Promise<import("../database/entities/mission-photo.entity").MissionPhoto>;
    findByMission(missionId: string): Promise<import("../database/entities/mission-photo.entity").MissionPhoto[]>;
    remove(id: string): Promise<void>;
}
