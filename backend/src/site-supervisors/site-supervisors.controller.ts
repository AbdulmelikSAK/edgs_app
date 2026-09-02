import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SiteSupervisorsService } from './site-supervisors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('site-supervisors')
@UseGuards(JwtAuthGuard)
export class SiteSupervisorsController {
  constructor(private readonly siteSupervisorsService: SiteSupervisorsService) {}

  @Get()
  async findAll(@Query('clientId') clientId?: string) {
    return this.siteSupervisorsService.findAll(clientId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.siteSupervisorsService.findOne(id);
  }

  @Post()
  async create(@Body() body: { firstName: string; lastName: string; phone?: string; email?: string; clientId: string }) {
    return this.siteSupervisorsService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.siteSupervisorsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.siteSupervisorsService.remove(id);
  }
}
