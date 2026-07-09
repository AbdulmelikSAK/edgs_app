import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { Mission } from '../database/entities/mission.entity';
import { Truck } from '../database/entities/truck.entity';
import { Client } from '../database/entities/client.entity';
import { Worksite } from '../database/entities/worksite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, Truck, Client, Worksite])],
  controllers: [MissionsController],
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}
