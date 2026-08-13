import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockItemDto {
  @ApiProperty({ example: 'Sable extra fin' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'sacs' })
  @IsOptional()
  @IsString()
  unit?: string;
}
