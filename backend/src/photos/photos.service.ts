import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionPhoto, PhotoType } from '../database/entities/mission-photo.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';
import { MinioService } from './minio.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(MissionPhoto) private photoRepo: Repository<MissionPhoto>,
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    private minioService: MinioService,
  ) {}

  async uploadPhoto(
    missionId: string,
    file: Express.Multer.File,
    type: PhotoType = PhotoType.DURING,
    employeeId?: string,
    notes?: string,
  ): Promise<MissionPhoto> {
    const mission = await this.missionRepo.findOne({ where: { id: missionId } });
    if (!mission) throw new NotFoundException('Mission non trouvée');
    const employee = employeeId ? await this.employeeRepo.findOne({ where: { id: employeeId } }) : null;

    const filename = `${missionId}/${randomUUID()}-${file.originalname}`;
    const url = await this.minioService.uploadFile(filename, file.buffer, file.mimetype);

    const photo = this.photoRepo.create({
      mission,
      takenBy: employee ?? undefined,
      type,
      url,
      filename,
      notes,
    });
    return this.photoRepo.save(photo);
  }

  findByMission(missionId: string): Promise<MissionPhoto[]> {
    return this.photoRepo.find({
      where: { mission: { id: missionId } },
      relations: { takenBy: true },
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string): Promise<void> {
    const photo = await this.photoRepo.findOne({ where: { id } });
    if (!photo) throw new NotFoundException('Photo non trouvée');
    if (photo.filename) {
      try {
        await this.minioService.deleteFile(photo.filename);
      } catch {}
    }
    await this.photoRepo.delete(id);
  }
}
