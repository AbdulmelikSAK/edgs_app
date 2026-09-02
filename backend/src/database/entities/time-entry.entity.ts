import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Mission } from './mission.entity';
import { Truck } from './truck.entity';

export enum TimeEntryType {
  DAY_START = 'day_start',
  DAY_END = 'day_end',
  MISSION_START = 'mission_start',
  MISSION_END = 'mission_end',
  PAUSE_START = 'pause_start',
  PAUSE_END = 'pause_end',
  INTEMPERIE = 'intemperie',
}

export enum TimeEntryStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  MODIFIED = 'modified',
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

  @Column({ nullable: true })
  entryCategory: string; // TRAVAIL, INTEMPERIE, ABSENCE, MALADIE, CONGE

  @Column({ default: false })
  isBadWeather: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hoursWorked: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true })
  displacementMode: string;

  @Column({ nullable: true, type: 'text' })
  signature: string;

  @Column({ default: false })
  isOutOfZone: boolean;

  @Column({ default: false })
  isSyncedFromOffline: boolean;

  @Column({ type: 'enum', enum: TimeEntryStatus, default: TimeEntryStatus.PENDING })
  validationStatus: TimeEntryStatus;

  @Column({ nullable: true, type: 'text' })
  validationNote: string;

  @Column({ nullable: true, type: 'timestamp' })
  validatedAt: Date;

  @Column({ nullable: true })
  validatedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
