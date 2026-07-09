import { Repository } from 'typeorm';
import { StockItem } from '../database/entities/stock-item.entity';
import type { Response } from 'express';
export declare class StockItemsController {
    private itemRepo;
    constructor(itemRepo: Repository<StockItem>);
    findAll(res: Response): Promise<Response<any, Record<string, any>>>;
    findOne(id: string): Promise<StockItem | null>;
    create(body: {
        name: string;
        unit?: string;
    }): Promise<StockItem>;
    update(id: string, body: {
        name?: string;
        unit?: string;
    }): Promise<StockItem | null>;
    remove(id: string): Promise<StockItem | null>;
}
