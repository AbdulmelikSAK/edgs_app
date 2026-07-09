import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from '../database/entities/report.entity';
import { Mission } from '../database/entities/mission.entity';
import { MissionPhoto } from '../database/entities/mission-photo.entity';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { GpsPoint } from '../database/entities/gps-point.entity';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Mission, MissionPhoto, TimeEntry, StockMovement, GpsPoint]),
    PhotosModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
