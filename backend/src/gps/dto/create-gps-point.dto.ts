import { IsNumber, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGpsPointDto {
  @ApiProperty()
  @IsUUID()
  truckId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  missionId?: string;

  @ApiProperty({ example: 48.8566 })
  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ example: 2.3522 })
  @IsNumber()
  @Type(() => Number)
  longitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  speed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  accuracy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSyncedFromOffline?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOutOfZone?: boolean;
}
