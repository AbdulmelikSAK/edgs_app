import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Mission } from './mission.entity';
import { User } from './user.entity';

export enum ReportStatus {
  GENERATING = 'generating',
  READY = 'ready',
  ERROR = 'error',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Mission)
  @JoinColumn()
  mission: Mission;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  generatedBy: User;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.GENERATING })
  status: ReportStatus;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  filename: string;

  @Column({ nullable: true, type: 'text' })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
