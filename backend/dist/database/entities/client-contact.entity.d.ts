import { Client } from './client.entity';
export declare class ClientContact {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    phone: string;
    email: string;
    client: Client;
    createdAt: Date;
    updatedAt: Date;
}
