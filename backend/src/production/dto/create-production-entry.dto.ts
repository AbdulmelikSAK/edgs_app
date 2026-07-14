import { IsString, IsOptional, IsNumber, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductionEntryDto {
  @ApiProperty()
  @IsUUID()
  missionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 'Sablage béton' })
  @IsString()
  prestationType: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 'm²' })
  @IsString()
  unit: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
