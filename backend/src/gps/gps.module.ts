import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GpsController } from './gps.controller';
import { GpsService } from './gps.service';
import { GpsGateway } from './gps.gateway';
import { GpsPoint } from '../database/entities/gps-point.entity';
import { Truck } from '../database/entities/truck.entity';
import { Mission } from '../database/entities/mission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GpsPoint, Truck, Mission])],
  controllers: [GpsController],
  providers: [GpsService, GpsGateway],
  exports: [GpsService],
})
export class GpsModule {}
