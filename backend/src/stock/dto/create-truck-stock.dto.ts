import { IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTruckStockDto {
  @ApiProperty()
  @IsUUID()
  truckId: string;

  @ApiProperty()
  @IsUUID()
  stockItemId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}
