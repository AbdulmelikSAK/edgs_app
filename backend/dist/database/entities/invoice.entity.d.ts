import { Client } from './client.entity';
import { Quote } from './quote.entity';
export declare class Invoice {
    id: string;
    invoiceNumber: string;
    quote: Quote;
    client: Client;
    status: string;
    date: Date;
    dueDate: Date;
    lines: string;
    totalHT: number;
    vatRate: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
