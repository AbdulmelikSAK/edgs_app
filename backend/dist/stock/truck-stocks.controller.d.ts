import { Repository } from 'typeorm';
import { TruckStock } from '../database/entities/truck-stock.entity';
import { Truck } from '../database/entities/truck.entity';
import { StockItem } from '../database/entities/stock-item.entity';
import type { Response } from 'express';
export declare class TruckStocksController {
    private tsRepo;
    private truckRepo;
    private itemRepo;
    constructor(tsRepo: Repository<TruckStock>, truckRepo: Repository<Truck>, itemRepo: Repository<StockItem>);
    findAll(res: Response): Promise<Response<any, Record<string, any>>>;
    findOne(id: string): Promise<TruckStock | null>;
    create(body: {
        truckId: string;
        stockItemId: string;
        quantity: number;
    }): Promise<TruckStock>;
    update(id: string, body: {
        quantity: number;
    }): Promise<TruckStock | null>;
    remove(id: string): Promise<TruckStock | null>;
}
