import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../database/entities/client.entity';
import { ClientContact } from '../database/entities/client-contact.entity';
import { SiteSupervisor } from '../database/entities/site-supervisor.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
    @InjectRepository(ClientContact)
    private contactRepo: Repository<ClientContact>,
    @InjectRepository(SiteSupervisor)
    private supervisorRepo: Repository<SiteSupervisor>,
  ) {}

  async create(dto: CreateClientDto): Promise<Client> {
    const { contacts, siteSupervisors, ...clientData } = dto;
    const client = this.clientRepo.create(clientData);
    const savedClient = await this.clientRepo.save(client);

    if (contacts && contacts.length > 0) {
      const contactEntities = contacts.map(c => this.contactRepo.create({ ...c, client: savedClient }));
      await this.contactRepo.save(contactEntities);
    }

    if (siteSupervisors && siteSupervisors.length > 0) {
      const supervisorEntities = siteSupervisors.map(s => this.supervisorRepo.create({ ...s, client: savedClient }));
      await this.supervisorRepo.save(supervisorEntities);
    }

    return this.findOne(savedClient.id);
  }

  findAll(): Promise<Client[]> {
    return this.clientRepo.find({
      where: { isActive: true },
      relations: { contacts: true, siteSupervisors: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepo.findOne({
      where: { id },
      relations: { contacts: true, siteSupervisors: true },
    });
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
