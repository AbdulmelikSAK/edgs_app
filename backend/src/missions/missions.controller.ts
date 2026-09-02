import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MissionStatus } from '../database/entities/mission.entity';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';

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

  @Get('export-excel')
  async exportExcel(@Res() res: Response) {
    const missions = await this.missionsService.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Chantiers EDGS');

    worksheet.addRow(['SASU EDGS']);
    worksheet.addRow(['Liste et métrés des chantiers']);
    worksheet.addRow([]);

    worksheet.getRow(1).font = { bold: true, size: 14 };
    worksheet.getRow(2).font = { italic: true, size: 11 };

    const headerRow = worksheet.addRow(['Année', 'Chantier', 'Nom du client', 'Type de prestation', 'Métré prévu', 'Métré réalisé', 'Unité']);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFEFEF' }
    };

    missions.forEach(m => {
      const year = m.scheduledDate ? new Date(m.scheduledDate).getFullYear() : new Date().getFullYear();
      worksheet.addRow([
        year,
        m.title,
        m.client ? m.client.name : m.clientName || 'Inconnu',
        m.type || 'Sablage',
        m.surfaceArea || 0,
        m.actualQuantity !== null && m.actualQuantity !== undefined ? m.actualQuantity : '--',
        m.actualUnit || m.estimatedUnit || 'm²'
      ]);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Chantiers_EDGS.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('today')
  @ApiQuery({ name: 'employeeId', required: true })
  findToday(@Query('employeeId') employeeId: string) {
    return this.missionsService.findTodayMissions(employeeId);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.missionsService.findEmployeeMissions(employeeId);
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
