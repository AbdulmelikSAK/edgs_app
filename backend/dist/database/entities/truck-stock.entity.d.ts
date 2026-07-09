import { Truck } from './truck.entity';
import { StockItem } from './stock-item.entity';
export declare class TruckStock {
    id: string;
    truck: Truck;
    stockItem: StockItem;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}
