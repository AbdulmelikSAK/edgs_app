import { Client } from './client.entity';
export declare class SiteSupervisor {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    client: Client;
    createdAt: Date;
    updatedAt: Date;
}
