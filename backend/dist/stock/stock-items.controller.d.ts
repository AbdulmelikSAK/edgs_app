import { Repository } from 'typeorm';
import { StockItem } from '../database/entities/stock-item.entity';
import type { Response } from 'express';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { UpdateStockItemDto } from './dto/update-stock-item.dto';
export declare class StockItemsController {
    private itemRepo;
    constructor(itemRepo: Repository<StockItem>);
    findAll(res: Response): Promise<Response<any, Record<string, any>>>;
    findOne(id: string): Promise<StockItem | null>;
    create(dto: CreateStockItemDto): Promise<StockItem>;
    update(id: string, dto: UpdateStockItemDto): Promise<StockItem | null>;
    remove(id: string): Promise<StockItem | null>;
}
