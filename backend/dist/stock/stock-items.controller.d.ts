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
        quantity?: number;
        minThreshold?: number;
        unitPrice?: number;
    }): Promise<StockItem>;
    update(id: string, body: {
        name?: string;
        unit?: string;
        quantity?: number;
        minThreshold?: number;
        unitPrice?: number;
    }): Promise<StockItem | null>;
    replenish(id: string, body: {
        quantity: number;
        unitPrice?: number;
        notes?: string;
    }): Promise<{
        item: StockItem;
        stockBefore: number;
        stockAfter: number;
    }>;
    consume(id: string, body: {
        quantity: number;
        missionId?: string;
        employeeId?: string;
        notes?: string;
    }): Promise<{
        item: StockItem;
        alert: boolean;
        stockBefore: number;
        stockAfter: number;
        totalCost: number;
    }>;
    remove(id: string): Promise<StockItem | null>;
}
