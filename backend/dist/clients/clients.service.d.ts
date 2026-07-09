import { Repository } from 'typeorm';
import { Client } from '../database/entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsService {
    private clientRepo;
    constructor(clientRepo: Repository<Client>);
    create(dto: CreateClientDto): Promise<Client>;
    findAll(): Promise<Client[]>;
    findOne(id: string): Promise<Client>;
    update(id: string, dto: UpdateClientDto): Promise<Client>;
    remove(id: string): Promise<void>;
}
