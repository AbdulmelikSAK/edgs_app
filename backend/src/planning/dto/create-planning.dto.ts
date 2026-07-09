import { IsInt, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePlanningDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Type(() => Number)
  year: number;

  @ApiProperty({ example: 28, description: 'Semaine ISO' })
  @IsInt()
  @Min(1)
  @Max(53)
  @Type(() => Number)
  week: number;

  @ApiProperty({ example: 1, description: '1=Lundi, 7=Dimanche' })
  @IsInt()
  @Min(1)
  @Max(7)
  @Type(() => Number)
  dayOfWeek: number;

  @ApiProperty()
  @IsUUID()
  missionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  truckId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
