import { Controller, Post, Get, Delete, Param, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PhotoType } from '../database/entities/mission-photo.entity';

@ApiTags('photos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('mission/:missionId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string' },
        employeeId: { type: 'string' },
        notes: { type: 'string' },
      },
    },
  })
  uploadPhoto(
    @Param('missionId') missionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: PhotoType,
    @Body('employeeId') employeeId?: string,
    @Body('notes') notes?: string,
  ) {
    return this.photosService.uploadPhoto(missionId, file, type, employeeId, notes);
  }

  @Get('mission/:missionId')
  findByMission(@Param('missionId') missionId: string) {
    return this.photosService.findByMission(missionId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.photosService.remove(id);
  }
}
