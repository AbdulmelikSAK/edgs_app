import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PlanningService } from './planning.service';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('planning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('planning')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Post()
  create(@Body() dto: CreatePlanningDto) {
    return this.planningService.create(dto);
  }

  @Get('week')
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'week', required: true, type: Number })
  findByWeek(@Query('year') year: string, @Query('week') week: string) {
    return this.planningService.findByWeek(+year, +week);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planningService.remove(id);
  }
}
