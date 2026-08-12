import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Truck } from './truck.entity';
import { Client } from './client.entity';
import { Worksite } from './worksite.entity';
import { Employee } from './employee.entity';

export enum MissionStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  clientName: string;

  @Column({ nullable: true })
  worksiteAddress: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: MissionStatus, default: MissionStatus.PLANNED })
  status: MissionStatus;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ nullable: true, type: 'timestamp' })
  startedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  surfaceArea: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fuelConsumption: number;

  @Column({ type: 'int', nullable: true })
  sandBagsUsed: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @ManyToOne(() => Truck, { nullable: true })
  @JoinColumn()
  truck: Truck;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn()
  client: Client;

  @ManyToOne(() => Worksite, { nullable: true })
  @JoinColumn()
  worksite: Worksite;

  @ManyToMany(() => Employee, { nullable: true })
  @JoinTable({ name: 'mission_employees' })
  employees: Employee[];

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'chef_de_mission_id' })
  chefDeMission: Employee | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
