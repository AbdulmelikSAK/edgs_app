import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../database/entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
  ) {}

  create(dto: CreateClientDto): Promise<Client> {
    const client = this.clientRepo.create(dto);
    return this.clientRepo.save(client);
  }

  findAll(): Promise<Client[]> {
    return this.clientRepo.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} non trouvé`);
    return client;
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, dto);
    return this.clientRepo.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    client.isActive = false;
    await this.clientRepo.save(client);
  }
}
