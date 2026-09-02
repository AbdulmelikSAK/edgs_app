import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSupervisor } from '../database/entities/site-supervisor.entity';
import { SiteSupervisorsService } from './site-supervisors.service';
import { SiteSupervisorsController } from './site-supervisors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSupervisor])],
  providers: [SiteSupervisorsService],
  controllers: [SiteSupervisorsController],
  exports: [SiteSupervisorsService],
})
export class SiteSupervisorsModule {}
