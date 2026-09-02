import { SiteSupervisorsService } from './site-supervisors.service';
export declare class SiteSupervisorsController {
    private readonly siteSupervisorsService;
    constructor(siteSupervisorsService: SiteSupervisorsService);
    findAll(clientId?: string): Promise<import("../database/entities/site-supervisor.entity").SiteSupervisor[]>;
    findOne(id: string): Promise<import("../database/entities/site-supervisor.entity").SiteSupervisor>;
    create(body: {
        firstName: string;
        lastName: string;
        phone?: string;
        email?: string;
        clientId: string;
    }): Promise<import("../database/entities/site-supervisor.entity").SiteSupervisor>;
    update(id: string, body: any): Promise<import("../database/entities/site-supervisor.entity").SiteSupervisor>;
    remove(id: string): Promise<void>;
}
