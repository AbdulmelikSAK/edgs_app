import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Mission } from './mission.entity';
import { Truck } from './truck.entity';

export enum TimeEntryType {
  DAY_START = 'day_start',
  DAY_END = 'day_end',
  MISSION_START = 'mission_start',
  MISSION_END = 'mission_end',
}

@Entity('time_entries')
export class TimeEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee)
  @JoinColumn()
  employee: Employee;

  @ManyToOne(() => Truck, { nullable: true })
  @JoinColumn()
  truck: Truck;

  @ManyToOne(() => Mission, { nullable: true })
  @JoinColumn()
  mission: Mission;

  @Column({ type: 'enum', enum: TimeEntryType })
  type: TimeEntryType;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ default: false })
  isSyncedFromOffline: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
