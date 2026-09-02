export declare class CreateClientDto {
    code?: string;
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    zipCode?: string;
    city?: string;
    countryCode?: string;
    contacts?: Array<{
        firstName: string;
        lastName: string;
        role?: string;
        phone?: string;
        email?: string;
    }>;
    siteSupervisors?: Array<{
        firstName: string;
        lastName: string;
        phone?: string;
        email?: string;
    }>;
}
