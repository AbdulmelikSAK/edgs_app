import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Mission } from '../database/entities/mission.entity';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { GpsPoint } from '../database/entities/gps-point.entity';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { Truck } from '../database/entities/truck.entity';
import { Employee } from '../database/entities/employee.entity';
import { ProductionEntry } from '../database/entities/production-entry.entity';
import { Equipment } from '../database/entities/equipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, TimeEntry, GpsPoint, StockMovement, Truck, Employee, ProductionEntry, Equipment])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
