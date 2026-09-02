import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TimeclockService } from './timeclock.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('timeclock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('timeclock')
export class TimeclockController {
  constructor(private readonly timeclockService: TimeclockService) {}

  @Post()
  create(@Body() dto: CreateTimeEntryDto) {
    return this.timeclockService.createEntry(dto);
  }

  @Post('sync')
  syncBatch(@Body() entries: CreateTimeEntryDto[]) {
    return this.timeclockService.syncBatch(entries);
  }

  @Get('all')
  findAllWithFilters(
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.timeclockService.findAllWithFilters(employeeId, startDate, endDate, status);
  }

  @Get('employee/:id')
  @ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD' })
  findByEmployee(@Param('id') id: string, @Query('date') date?: string) {
    return this.timeclockService.findByEmployee(id, date);
  }

  @Get('mission/:id')
  findByMission(@Param('id') id: string) {
    return this.timeclockService.findByMission(id);
  }

  @Post('validate-batch')
  validateBatch(@Body() body: { employeeId?: string; startDate?: string; endDate?: string; validatedBy?: string }) {
    return this.timeclockService.validateBatch(body.employeeId, body.startDate, body.endDate, body.validatedBy);
  }

  @Post(':id/validate')
  validateEntry(
    @Param('id') id: string,
    @Body() body: { status: string; validationNote?: string; newTimestamp?: string; validatedBy?: string },
  ) {
    return this.timeclockService.validateEntry(id, body.status, body.validationNote, body.newTimestamp, body.validatedBy);
  }

  @Get('employee/:id/flagged')
  findFlaggedForEmployee(@Param('id') id: string) {
    return this.timeclockService.findFlaggedForEmployee(id);
  }
}
