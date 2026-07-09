import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MissionStatus } from '../database/entities/mission.entity';

@ApiTags('missions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Post()
  create(@Body() dto: CreateMissionDto) {
    return this.missionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.missionsService.findAll();
  }

  @Get('today')
  @ApiQuery({ name: 'truckId', required: true })
  findToday(@Query('truckId') truckId: string) {
    return this.missionsService.findTodayMissions(truckId);
  }

  @Get('truck/:truckId')
  findByTruck(@Param('truckId') truckId: string) {
    return this.missionsService.findByTruck(truckId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.missionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMissionDto) {
    return this.missionsService.update(id, dto);
  }

  @Patch(':id/status/:status')
  updateStatus(@Param('id') id: string, @Param('status') status: MissionStatus) {
    return this.missionsService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.missionsService.remove(id);
  }
}
