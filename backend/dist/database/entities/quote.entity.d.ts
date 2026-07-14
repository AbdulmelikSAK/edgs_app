import { Client } from './client.entity';
import { Mission } from './mission.entity';
export declare class Quote {
    id: string;
    quoteNumber: string;
    client: Client;
    mission: Mission;
    status: string;
    date: Date;
    lines: string;
    totalHT: number;
    vatRate: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
