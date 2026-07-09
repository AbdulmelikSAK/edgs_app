import { TruckStock } from './truck-stock.entity';
export declare class Truck {
    id: string;
    plateNumber: string;
    pinCode: string;
    model: string;
    year: number;
    currentStock: number;
    stockAlertThreshold: number;
    isActive: boolean;
    stocks: TruckStock[];
    createdAt: Date;
    updatedAt: Date;
}
