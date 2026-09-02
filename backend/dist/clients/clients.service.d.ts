import { Repository } from 'typeorm';
import { Client } from '../database/entities/client.entity';
import { ClientContact } from '../database/entities/client-contact.entity';
import { SiteSupervisor } from '../database/entities/site-supervisor.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsService {
    private clientRepo;
    private contactRepo;
    private supervisorRepo;
    constructor(clientRepo: Repository<Client>, contactRepo: Repository<ClientContact>, supervisorRepo: Repository<SiteSupervisor>);
    create(dto: CreateClientDto): Promise<Client>;
    findAll(): Promise<Client[]>;
    findOne(id: string): Promise<Client>;
    update(id: string, dto: UpdateClientDto): Promise<Client>;
    remove(id: string): Promise<void>;
}
