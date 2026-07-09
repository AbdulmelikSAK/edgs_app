import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { MinioService } from './minio.service';
import { MissionPhoto } from '../database/entities/mission-photo.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MissionPhoto, Mission, Employee])],
  controllers: [PhotosController],
  providers: [PhotosService, MinioService],
  exports: [PhotosService, MinioService],
})
export class PhotosModule {}
