import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Truck } from './truck.entity';
import { Mission } from './mission.entity';

@Entity('gps_points')
export class GpsPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Truck)
  @JoinColumn()
  truck: Truck;

  @Index()
  @ManyToOne(() => Mission, { nullable: true })
  @JoinColumn()
  mission: Mission;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  speed: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  accuracy: number;

  @Column({ default: false })
  isSyncedFromOffline: boolean;

  @Column({ default: false })
  isOutOfZone: boolean;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
