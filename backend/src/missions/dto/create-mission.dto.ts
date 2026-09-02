import { IsString, IsOptional, IsDateString, IsNumber, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateMissionDto {
  @ApiProperty({ example: 'Sablage façade immeuble A' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  worksiteAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-07-10T08:00:00Z' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  estimatedPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  surfaceArea?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estimatedUnit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  truckId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  siteSupervisorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  worksiteId?: string;

  @ApiPropertyOptional({ type: [String], example: ['uuid-1', 'uuid-2'] })
  @IsOptional()
  @IsArray()
  employeeIds?: string[];

  @ApiPropertyOptional({ example: 'uuid-leader' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  chefDeMissionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  attachedFiles?: string[];
}
