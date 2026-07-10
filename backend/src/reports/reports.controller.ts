import { Controller, Post, Get, Param, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('generate/:missionId')
  generate(@Param('missionId') missionId: string) {
    return this.reportsService.generateReport(missionId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Get('view/:id')
  async viewReport(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.reportsService.getReportStream(id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    stream.pipe(res);
  }
}
