import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateTruckStockDto {
  @ApiProperty({ example: 15 })
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}
