import { Client } from './client.entity';
export declare class Worksite {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    notes: string;
    client: Client;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
