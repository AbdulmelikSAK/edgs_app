import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Worksite } from '../database/entities/worksite.entity';
import { Client } from '../database/entities/client.entity';
import { CreateWorksiteDto } from './dto/create-worksite.dto';
import { UpdateWorksiteDto } from './dto/update-worksite.dto';

@Injectable()
export class WorksitesService {
  constructor(
    @InjectRepository(Worksite) private worksiteRepo: Repository<Worksite>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
  ) {}

  async create(dto: CreateWorksiteDto): Promise<Worksite> {
    const client = dto.clientId ? await this.clientRepo.findOne({ where: { id: dto.clientId } }) : null;
    const ws = this.worksiteRepo.create({ ...dto, client: client ?? undefined });
    return this.worksiteRepo.save(ws);
  }

  findAll(): Promise<Worksite[]> {
    return this.worksiteRepo.find({ relations: { client: true }, where: { isActive: true } });
  }

  async findOne(id: string): Promise<Worksite> {
    const ws = await this.worksiteRepo.findOne({ where: { id }, relations: { client: true } });
    if (!ws) throw new NotFoundException(`Chantier ${id} non trouvé`);
    return ws;
  }

  async update(id: string, dto: UpdateWorksiteDto): Promise<Worksite> {
    const ws = await this.findOne(id);
    if (dto.clientId) {
      const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
      if (client) ws.client = client;
    }
    Object.assign(ws, dto);
    return this.worksiteRepo.save(ws);
  }

  async remove(id: string): Promise<void> {
    const ws = await this.findOne(id);
    ws.isActive = false;
    await this.worksiteRepo.save(ws);
  }
}
