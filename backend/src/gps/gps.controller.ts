import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GpsService } from './gps.service';
import { CreateGpsPointDto } from './dto/create-gps-point.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('gps')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gps')
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Post('track')
  track(@Body() dto: CreateGpsPointDto) {
    return this.gpsService.track(dto);
  }

  @Post('sync')
  syncBatch(@Body() points: CreateGpsPointDto[]) {
    return this.gpsService.syncBatch(points);
  }

  @Get('live')
  getLivePositions() {
    return this.gpsService.getLivePositions();
  }

  @Get('history/:truckId')
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getHistory(
    @Param('truckId') truckId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.gpsService.getHistory(truckId, from, to);
  }
}
