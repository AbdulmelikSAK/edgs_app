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
    mileage: number;
    insuranceExpirationDate: Date;
    controlTechniqueDate: Date;
    lastServiceDate: Date;
    registrationCardUrl: string;
    insuranceCardUrl: string;
    stocks: TruckStock[];
    createdAt: Date;
    updatedAt: Date;
}
