import { Controller, Post, Body, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TimeclockService } from './timeclock.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';

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

  @Get('export-excel')
  async exportExcel(
    @Res() res: Response,
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const entries = await this.timeclockService.findAllWithFilters(employeeId, startDate, endDate);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Heures');

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const now = new Date();
    const currentMonthYear = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    // Header 3 lines
    worksheet.addRow(['SASU EDGS']);
    worksheet.addRow(['61 route de Valréas, 84600 Grillon']);
    worksheet.addRow([`Récapitulatif des heures (${currentMonthYear})`]);
    worksheet.addRow([]); // empty spacing

    // Style title
    worksheet.getRow(1).font = { bold: true, size: 14 };
    worksheet.getRow(2).font = { italic: true, size: 11 };
    worksheet.getRow(3).font = { bold: true, size: 12, color: { argb: 'FF004B87' } };

    // Table 1 Header
    const headerRow1 = worksheet.addRow([
      'Nom du salarié',
      'Prénom du salarié',
      "Nombre d'heures de base",
      'Heures supp 25%',
      'Heures supp 50%',
      "Heures intempérie",
      "Absences / Maladies / Congés (heures)"
    ]);
    headerRow1.font = { bold: true };
    headerRow1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFEFEF' }
    };

    // Group entries by employee
    const empMap: { [id: string]: any } = {};
    for (const entry of entries) {
      const emp = entry.employee;
      if (!emp) continue;
      if (!empMap[emp.id]) {
        empMap[emp.id] = {
          lastName: emp.lastName,
          firstName: emp.firstName,
          baseHours: emp.baseMonthlyHours || 151.67,
          supp25: 0,
          supp50: 0,
          intemperieHours: 0,
          absenceHours: 0,
        };
      }
      const category = (entry as any).entryCategory || (entry as any).type || '';
      if (category === 'INTEMPERIE' || entry.isBadWeather) {
        empMap[emp.id].intemperieHours += 7;
      } else if (category === 'ABSENCE' || category === 'LEAVE' || category === 'MALADIE') {
        empMap[emp.id].absenceHours += 7;
      }
    }

    Object.values(empMap).forEach(row => {
      worksheet.addRow([
        row.lastName,
        row.firstName,
        row.baseHours,
        row.supp25,
        row.supp50,
        row.intemperieHours,
        row.absenceHours
      ]);
    });

    worksheet.addRow([]);
    worksheet.addRow(['Détail du nombre d\'heures par chantier']).font = { bold: true, size: 12 };

    const headerRow2 = worksheet.addRow(['Salarié', 'Chantier', 'Date', 'Type d\'entrée', 'Durée (heures)']);
    headerRow2.font = { bold: true };

    entries.forEach(entry => {
      worksheet.addRow([
        entry.employee ? `${entry.employee.firstName} ${entry.employee.lastName}` : 'Inconnu',
        entry.mission ? entry.mission.title : 'Dépôt / Autre',
        entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('fr-FR') : '--',
        (entry as any).entryCategory || (entry as any).type || 'TRAVAIL',
        7 // standard 7h per full day entry
      ]);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Heures_EDGS_${now.getFullYear()}_${now.getMonth()+1}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
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
