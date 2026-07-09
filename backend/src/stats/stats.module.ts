import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Mission } from '../database/entities/mission.entity';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { GpsPoint } from '../database/entities/gps-point.entity';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { Truck } from '../database/entities/truck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, TimeEntry, GpsPoint, StockMovement, Truck])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
