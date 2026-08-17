import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Mission } from './mission.entity';
import { Employee } from './employee.entity';
import { Worksite } from './worksite.entity';

export enum PhotoType {
  BEFORE = 'before',
  DURING = 'during',
  AFTER = 'after',
}

@Entity('mission_photos')
export class MissionPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Mission, { nullable: true })
  @JoinColumn()
  mission?: Mission | null;

  @ManyToOne(() => Worksite, { nullable: true })
  @JoinColumn()
  worksite?: Worksite | null;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn()
  takenBy?: Employee | null;

  @Column({ type: 'enum', enum: PhotoType, default: PhotoType.DURING })
  type: PhotoType;

  @Column()
  url: string;

  @Column({ nullable: true })
  filename: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
