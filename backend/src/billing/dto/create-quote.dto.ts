import { IsString, IsOptional, IsNumber, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateQuoteDto {
  @ApiProperty({ example: 'DEV-2026-0001' })
  @IsString()
  quoteNumber: string;

  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  missionId?: string;

  @ApiPropertyOptional({ example: 'Brouillon' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: '[{"description":"Sablage béton","quantity":150,"unitPrice":35}]' })
  @IsString()
  lines: string; // JSON string

  @ApiProperty({ example: 5250 })
  @IsNumber()
  @Type(() => Number)
  totalHT: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  vatRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
