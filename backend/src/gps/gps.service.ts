import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GpsPoint } from '../database/entities/gps-point.entity';
import { Truck } from '../database/entities/truck.entity';
import { Mission } from '../database/entities/mission.entity';
import { CreateGpsPointDto } from './dto/create-gps-point.dto';

@Injectable()
export class GpsService {
  constructor(
    @InjectRepository(GpsPoint) private gpsRepo: Repository<GpsPoint>,
    @InjectRepository(Truck) private truckRepo: Repository<Truck>,
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
  ) {}

  async track(dto: CreateGpsPointDto): Promise<GpsPoint> {
    const truck = await this.truckRepo.findOne({ where: { id: dto.truckId } });
    if (!truck) throw new NotFoundException('Camion non trouvé');
    const mission = dto.missionId ? await this.missionRepo.findOne({ where: { id: dto.missionId } }) : null;
    const point = this.gpsRepo.create({
      truck,
      mission: mission ?? undefined,
      latitude: dto.latitude,
      longitude: dto.longitude,
      speed: dto.speed,
      accuracy: dto.accuracy,
      isSyncedFromOffline: dto.isSyncedFromOffline ?? false,
    });
    return this.gpsRepo.save(point);
  }

  async syncBatch(points: CreateGpsPointDto[]): Promise<GpsPoint[]> {
    const results: GpsPoint[] = [];
    for (const dto of points) {
      dto.isSyncedFromOffline = true;
      results.push(await this.track(dto));
    }
    return results;
  }

  async getLivePositions(): Promise<any[]> {
    const result = await this.gpsRepo
      .createQueryBuilder('gps')
      .innerJoin('gps.truck', 'truck')
      .select([
        'truck.id AS "truckId"',
        'truck.plateNumber AS "plateNumber"',
        'gps.latitude AS latitude',
        'gps.longitude AS longitude',
        'gps.speed AS speed',
        'gps.createdAt AS "lastSeen"',
      ])
      .where('truck.isActive = true')
      .distinctOn(['truck.id'])
      .orderBy('truck.id')
      .addOrderBy('gps.createdAt', 'DESC')
      .getRawMany();
    return result;
  }

  getHistory(truckId: string, from?: string, to?: string): Promise<GpsPoint[]> {
    const qb = this.gpsRepo
      .createQueryBuilder('gps')
      .where('gps.truckId = :truckId', { truckId })
      .orderBy('gps.createdAt', 'ASC');
    if (from) qb.andWhere('gps.createdAt >= :from', { from });
    if (to) qb.andWhere('gps.createdAt <= :to', { to });
    return qb.take(1000).getMany();
  }
}
