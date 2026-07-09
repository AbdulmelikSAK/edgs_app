import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getGlobal(@Query('from') from?: string, @Query('to') to?: string) {
    return this.statsService.getGlobalStats(from, to);
  }

  @Get('truck/:id')
  getTruck(@Param('id') id: string) {
    return this.statsService.getTruckStats(id);
  }
}
