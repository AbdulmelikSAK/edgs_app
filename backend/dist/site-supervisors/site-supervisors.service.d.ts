import { Repository } from 'typeorm';
import { SiteSupervisor } from '../database/entities/site-supervisor.entity';
export declare class SiteSupervisorsService {
    private readonly siteSupervisorRepo;
    constructor(siteSupervisorRepo: Repository<SiteSupervisor>);
    findAll(clientId?: string): Promise<SiteSupervisor[]>;
    findOne(id: string): Promise<SiteSupervisor>;
    create(data: {
        firstName: string;
        lastName: string;
        phone?: string;
        email?: string;
        clientId: string;
    }): Promise<SiteSupervisor>;
    update(id: string, data: Partial<{
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
        clientId: string;
    }>): Promise<SiteSupervisor>;
    remove(id: string): Promise<void>;
}
