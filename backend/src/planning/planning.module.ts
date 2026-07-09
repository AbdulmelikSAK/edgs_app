import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningController } from './planning.controller';
import { PlanningService } from './planning.service';
import { WeeklyPlanning } from '../database/entities/weekly-planning.entity';
import { Mission } from '../database/entities/mission.entity';
import { Truck } from '../database/entities/truck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WeeklyPlanning, Mission, Truck])],
  controllers: [PlanningController],
  providers: [PlanningService],
})
export class PlanningModule {}
