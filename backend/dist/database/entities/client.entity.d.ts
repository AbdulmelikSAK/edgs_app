import { ClientContact } from './client-contact.entity';
import { SiteSupervisor } from './site-supervisor.entity';
export declare class Client {
    id: string;
    code: string;
    name: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
    zipCode: string;
    city: string;
    countryCode: string;
    isActive: boolean;
    contacts: ClientContact[];
    siteSupervisors: SiteSupervisor[];
    createdAt: Date;
    updatedAt: Date;
}
