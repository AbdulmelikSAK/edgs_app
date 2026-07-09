import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(dto: CreateClientDto): Promise<import("../database/entities/client.entity").Client>;
    findAll(): Promise<import("../database/entities/client.entity").Client[]>;
    findOne(id: string): Promise<import("../database/entities/client.entity").Client>;
    update(id: string, dto: UpdateClientDto): Promise<import("../database/entities/client.entity").Client>;
    remove(id: string): Promise<void>;
}
