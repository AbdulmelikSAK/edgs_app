import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

export enum LeaveType {
  CONGE = 'conge',
  RTT = 'rtt',
  SANS_SOLDE = 'sans_solde',
  AUTRE = 'autre',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  employee: Employee;

  @Column({ type: 'enum', enum: LeaveType, default: LeaveType.CONGE })
  type: LeaveType;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: false })
  isHalfDay: boolean;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.PENDING })
  status: LeaveStatus;

  @Column({ nullable: true, type: 'text' })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
