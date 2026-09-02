import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSupervisor } from '../database/entities/site-supervisor.entity';

@Injectable()
export class SiteSupervisorsService {
  constructor(
    @InjectRepository(SiteSupervisor)
    private readonly siteSupervisorRepo: Repository<SiteSupervisor>,
  ) {}

  async findAll(clientId?: string): Promise<SiteSupervisor[]> {
    const query = this.siteSupervisorRepo.createQueryBuilder('supervisor')
      .leftJoinAndSelect('supervisor.client', 'client');
    if (clientId) {
      query.where('client.id = :clientId', { clientId });
    }
    return query.orderBy('supervisor.lastName', 'ASC').getMany();
  }

  async findOne(id: string): Promise<SiteSupervisor> {
    const supervisor = await this.siteSupervisorRepo.findOne({
      where: { id },
      relations: { client: true },
    });
    if (!supervisor) {
      throw new NotFoundException(`Conducteur de travaux ${id} non trouvé`);
    }
    return supervisor;
  }

  async create(data: { firstName: string; lastName: string; phone?: string; email?: string; clientId: string }): Promise<SiteSupervisor> {
    const supervisor = this.siteSupervisorRepo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      client: { id: data.clientId } as any,
    });
    return this.siteSupervisorRepo.save(supervisor);
  }

  async update(id: string, data: Partial<{ firstName: string; lastName: string; phone: string; email: string; clientId: string }>): Promise<SiteSupervisor> {
    const supervisor = await this.findOne(id);
    if (data.firstName !== undefined) supervisor.firstName = data.firstName;
    if (data.lastName !== undefined) supervisor.lastName = data.lastName;
    if (data.phone !== undefined) supervisor.phone = data.phone;
    if (data.email !== undefined) supervisor.email = data.email;
    if (data.clientId !== undefined) supervisor.client = { id: data.clientId } as any;
    return this.siteSupervisorRepo.save(supervisor);
  }

  async remove(id: string): Promise<void> {
    const supervisor = await this.findOne(id);
    await this.siteSupervisorRepo.remove(supervisor);
  }
}
